import { api } from '@/shared/lib/api'
import type { LoginInput } from '../schemas/loginSchema'
import type { RegisterInput } from '../schemas/registerSchema'

export const authService = {
  login: (data: LoginInput) => api.post('/auth/login', data).then(r => r.data),
  register: (data: RegisterInput) =>
    api.post('/auth/register', data).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
}
