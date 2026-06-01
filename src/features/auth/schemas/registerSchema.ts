import { z } from 'zod'

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(4, 'Mínimo 4 caracteres')
      .max(25, 'Máximo 25 caracteres')
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Apenas letras'),
    lastname: z
      .string()
      .min(4, 'Mínimo 4 caracteres')
      .max(55, 'Máximo 55 caracteres')
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Apenas letras'),
    username: z
      .string()
      .min(4, 'Mínimo 4 caracteres')
      .max(25, 'Máximo 25 caracteres'),
    phone: z
      .string()
      .min(10, 'Mínimo 10 dígitos')
      .max(11, 'Máximo 11 dígitos')
      .regex(/^\d+$/, 'Apenas números'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
    birthdate: z.date({ error: 'Data de nascimento é obrigatória' }),
    bio: z.string().max(255, 'Máximo 255 caracteres').optional(),
    isPrivate: z.boolean(),
    preferredCategories: z
      .array(z.string())
      .max(10, 'No máximo 10 categorias')
      .optional(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type RegisterInput = z.infer<typeof registerSchema>

export type RegisterPayload = Omit<
  RegisterInput,
  'confirmPassword' | 'birthdate'
> & {
  birthdate: string
}
