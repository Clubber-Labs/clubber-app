import axios from 'axios'
import Constants from 'expo-constants'
import { getToken, deleteToken } from './secureStore'
import { router } from 'expo-router'

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
      await deleteToken()
      router.replace('/(auth)/login')
    }
    return Promise.reject(err)
  },
)
