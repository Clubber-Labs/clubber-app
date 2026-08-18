import { z } from 'zod'

// `identifier` = e-mail OU nome de usuário, resolvido no backend. String livre
// de propósito, espelhando o loginBodySchema de lá: username não restringe
// charset, então validar como e-mail recusaria identificador válido aqui.
export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'auth.errors.identifierRequired')
    .max(255),
  password: z.string().min(6, 'auth.errors.loginPasswordMin'),
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
