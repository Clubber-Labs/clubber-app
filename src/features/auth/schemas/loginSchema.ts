import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export type LoginInput = z.infer<typeof loginSchema>

// Resposta de sessão de /auth/login (usuário comum — sem o fluxo MFA, que é só
// do backoffice). `userId` é opcional: hoje o backend não o devolve e o id vem
// do /users/me, mas o campo documenta o fallback defensivo do hook.
export type LoginSessionResponse = {
  token: string
  refreshToken: string
  userId?: string
}
