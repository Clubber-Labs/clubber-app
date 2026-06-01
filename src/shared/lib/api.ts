import axios from 'axios'
import Constants from 'expo-constants'
import { getToken } from './secureStore'

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
    // é global — só o 404 de /users/me conta (tratado no boot/resume).
    if (err.response?.status === 401) unauthorizedHandler?.()
    return Promise.reject(err)
  },
)
