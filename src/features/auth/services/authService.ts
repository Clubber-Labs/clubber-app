import { api } from '@/shared/lib/api'
import type { LoginInput } from '../schemas/loginSchema'
import type { RegisterPayload } from '../schemas/registerSchema'

export const authService = {
  register: (data: RegisterPayload) =>
    api.post('/users', data).then(r => r.data),
  login: (data: LoginInput) => api.post('/auth/login', data).then(r => r.data),
  me: () => api.get('/users/me').then(r => r.data),
}
