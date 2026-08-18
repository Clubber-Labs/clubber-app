import { z } from 'zod'
import {
  isStrongPassword,
  MAX_PASSWORD_LENGTH,
} from '@/shared/utils/passwordStrength'

export const forgotPasswordEmailSchema = z.object({
  email: z.string().email('auth.errors.emailInvalid'),
})

export type ForgotPasswordEmailInput = z.infer<typeof forgotPasswordEmailSchema>

export const resetPasswordSchema = z
  .object({
    email: z.string().email('auth.errors.emailInvalid'),
    code: z
      .string()
      .length(6, 'auth.errors.codeSixDigits')
      .regex(/^\d{6}$/, 'auth.errors.codeSixDigits'),
    newPassword: z
      .string()
      .min(1, 'auth.errors.newPasswordRequired')
      .max(MAX_PASSWORD_LENGTH, 'auth.errors.passwordMax'),
    confirmPassword: z.string().min(1, 'auth.errors.newPasswordConfirm'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'auth.errors.passwordMismatch',
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
        message: 'auth.errors.passwordWeak',
      })
    }
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
