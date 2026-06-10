import Constants from 'expo-constants'
import { notificationWsFrameSchema } from '../schemas/notificationSchema'
import type { AppNotification } from '../schemas/notificationSchema'

type Handlers = {
  onNotification: (notification: AppNotification) => void
  // Disparado após uma RECONEXÃO bem-sucedida (não na 1ª conexão) — o socket
  // não faz replay do que se perdeu offline, então o consumidor rebusca via REST.
  onReconnect: () => void
  // Token inválido/expirado (close 4401) — sem rota de refresh no app, vira logout.
  onAuthError: () => void
}

const MAX_BACKOFF_MS = 30_000

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
    this.attempt = 0
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  private async open() {
    if (!this.shouldRun) return

    const token = await this.getToken?.()
    if (!this.shouldRun) return
    if (!token) {
      this.handlers?.onAuthError()
      this.stop()
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
      if (!this.shouldRun) return
      if ((event as { code?: number }).code === 4401) {
        this.handlers?.onAuthError()
        this.stop()
        return
      }
      this.scheduleReconnect()
    }
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
