import axios from 'axios'
import Constants from 'expo-constants'
import { getToken } from './secureStore'
import { endSession } from '@/features/auth/lib/session'

export const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiUrl,
})

api.interceptors.request.use(async config => {
  const token = await getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  async err => {
    // 401 = token inválido/expirado → encerra a sessão de forma centralizada
    // (limpa storage + caches + estado; o AuthGuard redireciona pro login e o
    // socket de chat fecha reativamente). 404 NÃO é global — só o 404 de
    // /users/me conta como sessão inválida (tratado no boot/resume).
    if (err.response?.status === 401) {
      await endSession({ expired: true })
    }
    return Promise.reject(err)
  },
)
