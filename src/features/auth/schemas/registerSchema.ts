import { z } from 'zod'
import { DEFAULT_CONSENT_FIELDS } from '@/features/privacy/constants'
import {
  MIN_PREFERRED_CATEGORIES,
  MIN_PREFERRED_CATEGORIES_MESSAGE,
} from '@/shared/utils/rolePreferences'
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '@/shared/utils/username'
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

// Um objeto por etapa do formulário. O schema completo é a soma deles, então os
// campos continuam definidos uma vez só — mas cada etapa também sabe se validar
// sozinha, o que o schema inteiro não consegue fazer no meio do cadastro (ver
// registerStepSchemas).
const personalStep = z.object({
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
    { message: 'Você precisa ter pelo menos 16 anos para usar o Clubber.' },
  ),
})

const accountStep = z.object({
  // Mesmos limites que a checagem de disponibilidade usa pra decidir se vale
  // consultar — divergir aqui faria o app consultar valor que o cadastro recusa.
  username: z
    .string()
    .min(USERNAME_MIN_LENGTH, `Mínimo ${USERNAME_MIN_LENGTH} caracteres`)
    .max(USERNAME_MAX_LENGTH, `Máximo ${USERNAME_MAX_LENGTH} caracteres`),
  email: z.string().email('E-mail inválido'),
  phone: z
    .string()
    .min(10, 'Mínimo 10 dígitos')
    .max(11, 'Máximo 11 dígitos')
    .regex(/^\d+$/, 'Apenas números'),
})

const passwordStep = z.object({
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirme sua senha'),
})

const profileStep = z.object({
  bio: z.string().max(255, 'Máximo 255 caracteres').optional(),
  isPrivate: z.boolean(),
  preferredCategories: z
    .array(z.string())
    .min(MIN_PREFERRED_CATEGORIES, MIN_PREFERRED_CATEGORIES_MESSAGE)
    .max(10, 'No máximo 10 categorias'),
  preferredSubcategories: z
    .array(z.string())
    .max(30, 'No máximo 30 interesses')
    .optional(),
})

const privacyStep = z.object({
  termsAccepted: z.boolean(),
  consents: consentFieldsSchema,
})

const passwordsMatch = (data: { password: string; confirmPassword: string }) =>
  data.password === data.confirmPassword
const PASSWORD_MISMATCH = {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
}

const acceptedTerms = (data: { termsAccepted: boolean }) => data.termsAccepted
const TERMS_REQUIRED = {
  message: 'É necessário aceitar os Termos de Uso e a Política de Privacidade.',
  path: ['termsAccepted'],
}

export const registerSchema = z
  .object({
    ...personalStep.shape,
    ...accountStep.shape,
    ...passwordStep.shape,
    ...profileStep.shape,
    ...privacyStep.shape,
  })
  .refine(passwordsMatch, PASSWORD_MISMATCH)
  .refine(acceptedTerms, TERMS_REQUIRED)

// O que o botão "Continuar" valida. Precisa ser um schema POR ETAPA porque um
// .refine() de objeto só roda com o objeto inteiro válido: no meio do cadastro
// os campos das etapas seguintes ainda estão vazios, então a regra senha ×
// confirmação seria pulada e só apareceria no submit final — duas telas depois
// do campo que a violou.
export const registerStepSchemas = [
  personalStep,
  accountStep,
  passwordStep.refine(passwordsMatch, PASSWORD_MISMATCH),
  profileStep,
  privacyStep.refine(acceptedTerms, TERMS_REQUIRED),
]

// Ordem das etapas = ordem dos campos em cada objeto. Deriva do schema pra não
// existir uma segunda lista de campos por etapa pra manter em sincronia.
export const REGISTER_STEP_FIELDS = [
  personalStep,
  accountStep,
  passwordStep,
  profileStep,
  privacyStep,
].map(step => Object.keys(step.shape)) as (keyof RegisterInput)[][]

export type RegisterInput = z.infer<typeof registerSchema>

export type RegisterPayload = Omit<
  RegisterInput,
  'confirmPassword' | 'birthdate' | 'termsAccepted' | 'consents'
> & {
  birthdate: string
}
