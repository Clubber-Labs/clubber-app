import { z } from 'zod'
import {
  isStrongPassword,
  MAX_PASSWORD_LENGTH,
} from '@/shared/utils/passwordStrength'

export const forgotPasswordEmailSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export type ForgotPasswordEmailInput = z.infer<typeof forgotPasswordEmailSchema>

export const resetPasswordSchema = z
  .object({
    email: z.string().email('E-mail inválido'),
    code: z
      .string()
      .length(6, 'O código tem 6 dígitos')
      .regex(/^\d{6}$/, 'O código tem 6 dígitos'),
    newPassword: z
      .string()
      .min(1, 'Informe a nova senha')
      .max(MAX_PASSWORD_LENGTH, 'Máximo 72 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
  // A política forte vive em passwordStrength.ts; o schema só a aplica, evitando
  // duplicar a regra entre validação e medidor. O teto de 72 já é reportado pelo
  // .max acima; aqui só tratamos o caso "dentro do tamanho, porém fraca".
  .superRefine((data, ctx) => {
    const len = data.newPassword.length
    if (
      len > 0 &&
      len <= MAX_PASSWORD_LENGTH &&
      !isStrongPassword(data.newPassword, data.email)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message:
          'Use 8+ caracteres com letras e números, evitando senhas óbvias.',
      })
    }
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
