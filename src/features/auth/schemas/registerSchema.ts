import { z } from 'zod'
import { DEFAULT_CONSENT_FIELDS } from '@/features/privacy/constants'
import type { ConsentFields } from '@/features/privacy/services/consentService'

export const DEFAULT_REGISTER_CONSENTS: ConsentFields = DEFAULT_CONSENT_FIELDS

const consentFieldsSchema = z.object({
  locationPrecise: z.boolean(),
  socialFeed: z.boolean(),
  socialVisibility: z.boolean(),
  pushNotifications: z.boolean(),
  marketing: z.boolean(),
  analytics: z.boolean(),
  surveys: z.boolean(),
}) satisfies z.ZodType<ConsentFields>

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
    birthdate: z.date({ error: 'Data de nascimento é obrigatória' }).refine(
      date => {
        const today = new Date()
        const minimum = new Date(
          today.getFullYear() - 16,
          today.getMonth(),
          today.getDate(),
        )
        return date <= minimum
      },
      { message: 'Você precisa ter pelo menos 16 anos para usar o ConnectAI.' },
    ),
    bio: z.string().max(255, 'Máximo 255 caracteres').optional(),
    isPrivate: z.boolean(),
    preferredCategories: z
      .array(z.string())
      .max(10, 'No máximo 10 categorias')
      .optional(),
    termsAccepted: z.boolean(),
    consents: consentFieldsSchema,
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
  .refine(data => data.termsAccepted, {
    message:
      'É necessário aceitar os Termos de Uso e a Política de Privacidade.',
    path: ['termsAccepted'],
  })

export type RegisterInput = z.infer<typeof registerSchema>

export type RegisterPayload = Omit<
  RegisterInput,
  'confirmPassword' | 'birthdate' | 'termsAccepted' | 'consents'
> & {
  birthdate: string
}
