import axios from 'axios'
import Constants from 'expo-constants'
import { getToken, clearAuthSession } from './secureStore'
import { useAuthStore } from '@/features/auth/store/authStore'

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
    if (err.response?.status === 401) {
      await clearAuthSession()
      useAuthStore.getState().logout()
    }
    return Promise.reject(err)
  },
)
