import axios, { type AxiosError } from 'axios'
import Constants from 'expo-constants'
import { isUnauthorizedError } from './apiError'
import {
  getRefreshToken,
  getToken,
  saveRefreshToken,
  saveToken,
} from './secureStore'

declare module 'axios' {
  interface AxiosRequestConfig {
    // Quando true, o interceptor de resposta NÃO dispara o handler global de 401
    // nem tenta refresh. Usado pela reautenticação da exclusão de conta (ali um
    // 401 significa "Senha incorreta") e pela própria chamada de /auth/refresh.
    skipAuthHandler?: boolean
    // Quando true, o interceptor de request NÃO anexa o header Authorization.
    // Usado pelo /auth/refresh: é rota PÚBLICA e o contrato exige que o access
    // (já expirado) não seja enviado — mandá-lo pode fazer o refresh falhar.
    skipAuthHeader?: boolean
    // Marca um request já re-tentado após um refresh bem-sucedido — evita loop
    // caso o retry também volte 401.
    _retry?: boolean
  }
}

export const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiUrl,
})

// Reação a 401 IRRECUPERÁVEL (refresh falhou) registrada pela feature de auth
// (useRestoreSession). Mantém shared/ agnóstico a features: o interceptor só
// SINALIZA; quem encerra a sessão (endSession) é a auth. Dependência fica
// unidirecional (features→shared).
let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

api.interceptors.request.use(async config => {
  if (config.skipAuthHeader) return config
  const token = await getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Refresh de sessão (rotação transparente) ─────────────────────────────────
// O access token é curto; quando expira, o backend responde 401 (HTTP) ou fecha
// o socket com 4401 (WS). Em vez de derrubar a sessão, trocamos o refresh token
// por um par novo e re-tentamos. O refresh é SINGLE-FLIGHT: todos os caminhos
// (interceptor HTTP e os WebSockets) coalescem na MESMA rotação — duas rotações
// em paralelo invalidariam uma à outra (reuso de token rotacionado fora da
// janela de carência → o backend revoga a família INTEIRA → logout geral).

// Falha IRRECUPERÁVEL do refresh — não há mais refresh token guardado. Marcada
// como terminal (encerra a sessão), ao contrário de uma falha de rede.
class MissingRefreshTokenError extends Error {}

// Distingue "sessão de fato perdida" (refresh ausente ou rejeitado com 401) de
// "falha transitória" (rede/5xx/429). Só a primeira deve deslogar o usuário —
// o contrato manda encerrar a sessão SÓ quando o refresh volta 401. Exportada
// para os sockets classificarem o desfecho do refresh igual ao interceptor.
export function isTerminalRefreshError(error: unknown): boolean {
  return error instanceof MissingRefreshTokenError || isUnauthorizedError(error)
}

// Troca o refresh atual por um par novo e persiste.
async function refreshSession(): Promise<void> {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) throw new MissingRefreshTokenError('no refresh token')
  const { data } = await api.post<{ token: string; refreshToken: string }>(
    '/auth/refresh',
    { refreshToken },
    // skipAuthHandler: o próprio refresh não deve disparar o fluxo de 401.
    // skipAuthHeader: rota pública — não enviar o access (expirado) no header.
    { skipAuthHandler: true, skipAuthHeader: true },
  )
  // Persiste o REFRESH novo ANTES do access. O backend já revogou o refresh
  // antigo ao responder; se o app for morto/suspenso entre os dois saves, o
  // estado intermediário (refresh NOVO + access ANTIGO) é RECUPERÁVEL — o access
  // antigo expira e renova com o refresh novo. A ordem inversa deixaria
  // (access novo + refresh ANTIGO já revogado): o próximo refresh apresentaria
  // um token rotacionado e, fora da janela de carência, o backend derrubaria a
  // família inteira — deslogando o usuário "sem motivo".
  await saveRefreshToken(data.refreshToken)
  await saveToken(data.token)
}

// Single-flight: enquanto um refresh está em curso, todos os chamadores
// (HTTP/WS) recebem a MESMA promise e disparam só UMA rotação.
let refreshInFlight: Promise<void> | null = null

export function refreshAccessToken(): Promise<void> {
  if (!refreshInFlight) {
    refreshInFlight = refreshSession().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

api.interceptors.response.use(
  res => res,
  async (err: AxiosError) => {
    const original = err.config
    // Só tratamos 401 recuperável: precisa ter config, não ser uma chamada que
    // trata o 401 localmente (skipAuthHandler) e ainda não ter sido re-tentada.
    if (
      err.response?.status !== 401 ||
      !original ||
      original.skipAuthHandler ||
      original._retry
    ) {
      return Promise.reject(err)
    }

    // _retry marca ANTES do refresh: se o retry também voltar 401, este guard
    // o rejeita de cara (sem novo refresh) — evita loop. 401s concorrentes
    // coalescem no mesmo refreshAccessToken() e cada um re-tenta ao terminar.
    original._retry = true
    try {
      await refreshAccessToken()
    } catch (refreshErr) {
      // Só encerra a sessão se o refresh foi de fato rejeitado (401) ou não há
      // mais refresh token. Falha de rede/5xx/429 é transitória: mantém a sessão
      // e deixa o request original falhar normalmente (o usuário pode retentar).
      if (isTerminalRefreshError(refreshErr)) unauthorizedHandler?.()
      return Promise.reject(refreshErr)
    }
    // O request interceptor relê o token novo do SecureStore no retry.
    return api(original)
  },
)
