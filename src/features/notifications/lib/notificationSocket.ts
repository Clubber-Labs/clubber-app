import Constants from 'expo-constants'
import { isTerminalRefreshError, refreshAccessToken } from '@/shared/lib/api'
import { notificationWsFrameSchema } from '../schemas/notificationSchema'
import type { AppNotification } from '../schemas/notificationSchema'

type Handlers = {
  onNotification: (notification: AppNotification) => void
  // Disparado após uma RECONEXÃO bem-sucedida (não na 1ª conexão) — o socket
  // não faz replay do que se perdeu offline, então o consumidor rebusca via REST.
  onReconnect: () => void
  // Refresh do token falhou de forma TERMINAL (refresh expirado/revogado) — a
  // sessão acabou de verdade. Só é chamado depois de tentar renovar (ver
  // handleAuthClose), nunca direto no 4401.
  onAuthError: () => void
}

const MAX_BACKOFF_MS = 30_000
// Tempo aberto que a conexão precisa sustentar pra ser considerada "estável" e
// baixar a guarda anti-loop de refresh.
const STABLE_CONNECTION_MS = 10_000

function buildWsUrl(token: string): string | null {
  const apiUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined
  if (!apiUrl) return null
  // http→ws, https→wss. Token vai na query (handshake WS não manda header
  // Authorization). O servidor pinga a cada 30s (pong é automático no RN) e
  // revalida o JWT a cada 60s.
  const base = apiUrl.replace(/^http/, 'ws')
  return `${base}/ws/notifications?token=${encodeURIComponent(token)}`
}

// Manager singleton fora do React, mesmo padrão do chatSocket. O ciclo de vida
// é controlado por useNotificationsRealtime (start/stop conforme auth + AppState).
class NotificationSocket {
  private ws: WebSocket | null = null
  private handlers: Handlers | null = null
  private getToken: (() => Promise<string | null>) | null = null
  private shouldRun = false
  // "Já conectou ao menos uma vez nesta vida do singleton" — NÃO é zerado por
  // stop(): retomar após um stop (foreground voltando do background OU queda
  // de rede) conta como RECONEXÃO e dispara onReconnect → re-sync via REST.
  private hadConnected = false
  // Renovou o token desde a última conexão ABERTA com sucesso. Guarda contra
  // loop de refresh: se mesmo após renovar o servidor fechar de novo com 4401, a
  // sessão é de fato inválida → desloga. Só é zerado depois da conexão ficar
  // estável (ver stableTimer) — assim um socket que abre e cai logo (aceito e
  // fechado com 4401) mantém a guarda e cai no logout no 2º ciclo, em vez de
  // martelar /auth/refresh sem backoff.
  private refreshedSinceOpen = false
  private attempt = 0
  private timer: ReturnType<typeof setTimeout> | null = null
  // Agenda o reset de refreshedSinceOpen quando a conexão se prova estável.
  // Limpo no onclose e no stop (conexão que cai antes não baixa a guarda).
  private stableTimer: ReturnType<typeof setTimeout> | null = null

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
    this.clearStableTimer()
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
    this.attempt = 0
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  private clearStableTimer() {
    if (this.stableTimer) {
      clearTimeout(this.stableTimer)
      this.stableTimer = null
    }
  }

  private async open() {
    if (!this.shouldRun) return

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
      // Só baixa a guarda depois que a conexão provar estável: se cair antes
      // (flap de 4401), refreshedSinceOpen continua true e o 2º ciclo desloga.
      this.clearStableTimer()
      this.stableTimer = setTimeout(() => {
        this.refreshedSinceOpen = false
        this.stableTimer = null
      }, STABLE_CONNECTION_MS)
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
      // Validação defensiva: frame fora do contrato é ignorado (tolerante a
      // frames futuros do backend e a payloads malformados).
      const frame = notificationWsFrameSchema.safeParse(parsed)
      if (frame.success) this.handlers?.onNotification(frame.data.notification)
    }

    ws.onerror = () => {
      // Deixa o onclose decidir a reconexão (erro sempre é seguido de close).
    }

    ws.onclose = event => {
      this.ws = null
      this.clearStableTimer()
      if (!this.shouldRun) return
      if ((event as { code?: number }).code === 4401) {
        // Token expirado/inválido: renova e reconecta em vez de deslogar.
        void this.handleAuthClose()
        return
      }
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

export const notificationSocket = new NotificationSocket()
