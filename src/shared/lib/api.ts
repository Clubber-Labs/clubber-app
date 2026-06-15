import axios, { type AxiosError } from 'axios'
import Constants from 'expo-constants'
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
  const token = await getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Refresh de sessão (rotação transparente) ─────────────────────────────────
// O access token é curto; quando expira, o backend responde 401. Em vez de
// derrubar a sessão na hora, trocamos o refresh token por um par novo e
// re-tentamos o request original. 401s concorrentes esperam num único refresh
// (fila) pra não disparar N rotações em paralelo (a 2ª invalidaria a 1ª).
let isRefreshing = false
let pendingQueue: { resolve: () => void; reject: (err: unknown) => void }[] = []

function flushQueue(error: unknown) {
  for (const p of pendingQueue) {
    if (error) p.reject(error)
    else p.resolve()
  }
  pendingQueue = []
}

// Troca o refresh atual por um par novo e persiste. O backend rotaciona o
// refresh a cada uso; por isso salvamos o novo refresh também.
async function refreshSession(): Promise<void> {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) throw new Error('no refresh token')
  const { data } = await api.post<{ token: string; refreshToken: string }>(
    '/auth/refresh',
    { refreshToken },
    // skipAuthHandler já faz o interceptor sair cedo se o próprio refresh der
    // 401 — não precisa de _retry aqui.
    { skipAuthHandler: true },
  )
  await saveToken(data.token)
  await saveRefreshToken(data.refreshToken)
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

    // Já há um refresh em curso: enfileira e re-tenta quando ele terminar.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: () => {
            original._retry = true
            resolve(api(original))
          },
          reject,
        })
      })
    }

    original._retry = true
    isRefreshing = true
    try {
      await refreshSession()
    } catch (refreshErr) {
      isRefreshing = false
      flushQueue(refreshErr)
      // Refresh falhou (expirado/revogado): aí sim encerra a sessão de verdade.
      unauthorizedHandler?.()
      return Promise.reject(refreshErr)
    }
    // Baixa o flag e drena a fila ANTES de re-tentar: um 401 que chegue durante
    // o round-trip do retry inicia um ciclo novo (com token já fresco) em vez de
    // entrar numa fila que já foi drenada e ficar pendurado pra sempre.
    isRefreshing = false
    flushQueue(null)
    // O request interceptor relê o token novo do SecureStore no retry.
    return api(original)
  },
)
