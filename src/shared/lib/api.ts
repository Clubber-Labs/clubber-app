import axios from 'axios'
import Constants from 'expo-constants'
import { getToken } from './secureStore'

declare module 'axios' {
  interface AxiosRequestConfig {
    // Quando true, o interceptor de resposta NÃO dispara o handler global de 401.
    // Usado pela reautenticação da exclusão de conta: ali um 401 significa "Senha
    // incorreta" e deve virar erro inline, não encerrar a sessão.
    skipAuthHandler?: boolean
  }
}

export const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiUrl,
})

// Reação a 401 registrada pela feature de auth (useRestoreSession). Mantém
// shared/ agnóstico a features: o interceptor só SINALIZA o 401; quem encerra a
// sessão (endSession) é a auth. Dependência fica unidirecional (features→shared).
let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

api.interceptors.request.use(async config => {
  const token = await getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    // 401 = token inválido/expirado → a auth encerra a sessão (limpa storage +
    // caches + estado; AuthGuard redireciona e o socket fecha reativo). 404 NÃO
    // é global — só o 404 de /users/me conta (tratado no boot/resume). Requests
    // com skipAuthHandler tratam o 401 localmente (ex: senha incorreta na exclusão).
    if (err.response?.status === 401 && !err.config?.skipAuthHandler) {
      unauthorizedHandler?.()
    }
    return Promise.reject(err)
  },
)
