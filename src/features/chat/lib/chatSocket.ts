import Constants from 'expo-constants'
import { isTerminalRefreshError, refreshAccessToken } from '@/shared/lib/api'
import {
  isMessageFrame,
  isMessageUpdateFrame,
  isPresenceFrame,
  isReceiptFrame,
  isTypingFrame,
  type MessageFrame,
  type MessageUpdateFrame,
  type PresenceFrame,
  type ReceiptFrame,
  type TypingFrame,
} from '../types'
import type { ConnectionStatus } from '../store/chatRealtimeStore'

// Único frame que o cliente ENVIA ao servidor (ver contrato): "digitando".
export type OutboundFrame = {
  type: 'typing'
  conversationId: string
  isTyping: boolean
}

type Handlers = {
  onStatus: (status: ConnectionStatus) => void
  onMessageFrame: (frame: MessageFrame) => void
  // Edição de mensagem existente OU reação adicionada/removida (atualiza in-place
  // por id — o frame carrega a Message inteira).
  onMessageUpdate: (frame: MessageUpdateFrame) => void
  // Recibo de entrega/leitura de um participante (avança watermark).
  onReceipt: (frame: ReceiptFrame) => void
  // Alguém começou/parou de digitar numa conversa.
  onTyping: (frame: TypingFrame) => void
  // Presença global (online/offline + visto por último) de um usuário.
  onPresence: (frame: PresenceFrame) => void
  // Disparado após uma RECONEXÃO bem-sucedida (não na 1ª conexão) — o socket
  // não faz replay do que se perdeu offline, então o consumidor rebusca via REST.
  onReconnect: () => void
  // Refresh do token falhou de forma TERMINAL (refresh expirado/revogado) — a
  // sessão acabou de verdade. Só é chamado depois de tentar renovar (ver
  // handleAuthClose), nunca direto no 4401.
  onAuthError: () => void
}

const MAX_BACKOFF_MS = 30_000
// readyState OPEN (igual em todas as libs de WebSocket).
const WS_OPEN = 1

function buildWsUrl(token: string): string | null {
  const apiUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined
  if (!apiUrl) return null
  // http→ws, https→wss. Token vai na query (handshake WS não manda header Authorization).
  const base = apiUrl.replace(/^http/, 'ws')
  return `${base}/ws/chat?token=${encodeURIComponent(token)}`
}

// Manager singleton, fora do React. O ciclo de vida é controlado por
// useChatRealtime (start/stop conforme auth + AppState).
class ChatSocket {
  private ws: WebSocket | null = null
  private handlers: Handlers | null = null
  private getToken: (() => Promise<string | null>) | null = null
  private shouldRun = false
  // "Já conectou ao menos uma vez nesta vida do singleton" — NÃO é zerado por
  // stop(): assim, retomar após um stop (foreground voltando do background OU
  // queda de rede) conta como RECONEXÃO e dispara onReconnect → re-sync via REST.
  // Só a 1ª conexão fria (valor inicial false) não dispara, pois as telas já
  // buscam dados frescos ao montar.
  private hadConnected = false
  // Renovou o token desde a última conexão ABERTA com sucesso. Zerado no onopen.
  // Guarda contra loop de refresh: se mesmo após renovar o servidor fechar de
  // novo com 4401, a sessão é de fato inválida → desloga.
  private refreshedSinceOpen = false
  private attempt = 0
  private timer: ReturnType<typeof setTimeout> | null = null

  start(getToken: () => Promise<string | null>, handlers: Handlers) {
    this.getToken = getToken
    this.handlers = handlers
    if (this.shouldRun) return
    this.shouldRun = true
    this.attempt = 0
    void this.open()
  }

  stop() {
    this.shouldRun = false
    this.clearTimer()
    if (this.ws) {
      // Zera o onclose pra não agendar reconexão num fechamento intencional.
      this.ws.onclose = null
      try {
        this.ws.close()
      } catch {
        // ignore
      }
      this.ws = null
    }
    // hadConnected NÃO é zerado aqui de propósito (ver campo) — o próximo open()
    // após este stop deve ser tratado como reconexão e re-sincronizar via REST.
    this.attempt = 0
    this.handlers?.onStatus('offline')
  }

  // Envia um frame ao servidor (hoje só "digitando"). Best-effort: se o socket
  // não está aberto, o frame é descartado — typing é efêmero e não vale enfileirar.
  send(frame: OutboundFrame) {
    const ws = this.ws
    if (!ws || ws.readyState !== WS_OPEN) return
    try {
      ws.send(JSON.stringify(frame))
    } catch {
      // ignore
    }
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  private async open() {
    if (!this.shouldRun) return
    this.handlers?.onStatus(this.hadConnected ? 'reconnecting' : 'connecting')

    const token = await this.getToken?.()
    if (!this.shouldRun) return
    if (!token) {
      // Sem access token (expirou ou foi limpo): tenta renovar antes de
      // deslogar — só encerra a sessão se o refresh for terminal.
      void this.handleAuthClose()
      return
    }

    const url = buildWsUrl(token)
    if (!url) {
      this.scheduleReconnect()
      return
    }

    let ws: WebSocket
    try {
      ws = new WebSocket(url)
    } catch {
      this.scheduleReconnect()
      return
    }
    this.ws = ws

    ws.onopen = () => {
      const wasReconnect = this.hadConnected
      this.hadConnected = true
      this.attempt = 0
      this.refreshedSinceOpen = false
      this.handlers?.onStatus('connected')
      if (wasReconnect) this.handlers?.onReconnect()
    }

    ws.onmessage = event => {
      const raw = (event as { data?: unknown }).data
      if (typeof raw !== 'string') return
      let parsed: unknown
      try {
        parsed = JSON.parse(raw)
      } catch {
        return
      }
      // Tipos desconhecidos são ignorados (tolerante a frames futuros do backend).
      if (isMessageFrame(parsed)) this.handlers?.onMessageFrame(parsed)
      else if (isMessageUpdateFrame(parsed))
        this.handlers?.onMessageUpdate(parsed)
      else if (isReceiptFrame(parsed)) this.handlers?.onReceipt(parsed)
      else if (isTypingFrame(parsed)) this.handlers?.onTyping(parsed)
      else if (isPresenceFrame(parsed)) this.handlers?.onPresence(parsed)
    }

    ws.onerror = () => {
      // Deixa o onclose decidir a reconexão (erro sempre é seguido de close).
    }

    ws.onclose = event => {
      this.ws = null
      if (!this.shouldRun) return
      if ((event as { code?: number }).code === 4401) {
        // Token expirado/inválido: renova e reconecta em vez de deslogar.
        this.handlers?.onStatus('reconnecting')
        void this.handleAuthClose()
        return
      }
      this.handlers?.onStatus('reconnecting')
      this.scheduleReconnect()
    }
  }

  // 4401 (ou ausência de token) = o servidor rejeitou o access token. Em vez de
  // encerrar a sessão na hora, renova via o MESMO refresh single-flight do HTTP
  // (api.ts) e reconecta. Só desloga se o refresh falhar de forma TERMINAL
  // (refresh expirado/revogado, ou sessão já limpa); falha transitória (rede)
  // faz backoff sem deslogar. refreshedSinceOpen evita loop de refresh.
  private async handleAuthClose() {
    try {
      await refreshAccessToken()
    } catch (err) {
      // Parado durante o refresh (background/logout): fica quieto, não desloga.
      if (!this.shouldRun) return
      if (isTerminalRefreshError(err)) {
        this.handlers?.onAuthError()
        this.stop()
        return
      }
      // Transitório (rede/5xx): mantém a sessão e tenta de novo com backoff.
      this.scheduleReconnect()
      return
    }
    if (!this.shouldRun) return
    if (this.refreshedSinceOpen) {
      // Já renovamos desde a última conexão aberta e ainda assim caímos: a
      // sessão é de fato inválida.
      this.handlers?.onAuthError()
      this.stop()
      return
    }
    this.refreshedSinceOpen = true
    void this.open()
  }

  private scheduleReconnect() {
    if (!this.shouldRun) return
    this.clearTimer()
    // Backoff exponencial com jitter: 1s, 2s, 4s… ≤30s.
    const base = Math.min(1000 * 2 ** this.attempt, MAX_BACKOFF_MS)
    const delay = base + Math.random() * base * 0.25
    this.attempt += 1
    this.timer = setTimeout(() => void this.open(), delay)
  }
}

export const chatSocket = new ChatSocket()
