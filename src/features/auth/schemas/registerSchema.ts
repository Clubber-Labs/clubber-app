import { z } from 'zod'
import { MIN_PREFERRED_CATEGORIES } from '@/shared/utils/rolePreferences'
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEX,
} from '@/shared/utils/username'
import { PHONE_MAX_DIGITS } from '@/shared/utils/masks'

// Um objeto por etapa do formulário. O aceite dos documentos NÃO é campo daqui:
// o backend registra na transação do cadastro, e a tela só informa (LegalNotice).
// Um objeto por etapa do formulário. O schema completo é a soma deles, então os
// campos continuam definidos uma vez só — mas cada etapa também sabe se validar
// sozinha, o que o schema inteiro não consegue fazer no meio do cadastro (ver
// registerStepSchemas).
const personalStep = z.object({
  name: z
    .string()
    .min(4, 'auth.errors.nameMin')
    .max(25, 'auth.errors.nameMax')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'auth.errors.lettersOnly'),
  lastname: z
    .string()
    .min(4, 'auth.errors.lastnameMin')
    .max(55, 'auth.errors.lastnameMax')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'auth.errors.lettersOnly'),
  birthdate: z.date({ error: 'auth.errors.birthdateRequired' }).refine(
    date => {
      const today = new Date()
      const minimum = new Date(
        today.getFullYear() - 16,
        today.getMonth(),
        today.getDate(),
      )
      return date <= minimum
    },
    { message: 'auth.errors.minimumAge' },
  ),
})

const accountStep = z.object({
  // Mesmos limites que a checagem de disponibilidade usa pra decidir se vale
  // consultar — divergir aqui faria o app consultar valor que o cadastro recusa.
  username: z
    .string()
    .min(USERNAME_MIN_LENGTH, 'auth.errors.usernameMin')
    .max(USERNAME_MAX_LENGTH, 'auth.errors.usernameMax')
    .regex(USERNAME_REGEX, 'auth.errors.usernameFormat'),
  email: z.string().email('auth.errors.emailInvalid'),
  phone: z
    .string()
    .min(10, 'auth.errors.phoneMin')
    .max(PHONE_MAX_DIGITS, 'auth.errors.phoneMax')
    .regex(/^\d+$/, 'auth.errors.digitsOnly'),
})

const passwordStep = z.object({
  password: z.string().min(8, 'auth.errors.passwordMin'),
  confirmPassword: z.string().min(1, 'auth.errors.passwordConfirm'),
})

const profileStep = z.object({
  bio: z.string().max(255, 'auth.errors.bioMax').optional(),
  isPrivate: z.boolean(),
  preferredCategories: z
    .array(z.string())
    .min(MIN_PREFERRED_CATEGORIES, 'auth.errors.categoriesMin')
    .max(10, 'auth.errors.categoriesMax'),
  preferredSubcategories: z
    .array(z.string())
    .max(30, 'auth.errors.subcategoriesMax')
    .optional(),
})

const passwordsMatch = (data: { password: string; confirmPassword: string }) =>
  data.password === data.confirmPassword
const PASSWORD_MISMATCH = {
  message: 'auth.errors.passwordMismatch',
  path: ['confirmPassword'],
}

export const registerSchema = z
  .object({
    ...personalStep.shape,
    ...accountStep.shape,
    ...passwordStep.shape,
    ...profileStep.shape,
  })
  .refine(passwordsMatch, PASSWORD_MISMATCH)

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
]

// Ordem das etapas = ordem dos campos em cada objeto. Deriva do schema pra não
// existir uma segunda lista de campos por etapa pra manter em sincronia.
export const REGISTER_STEP_FIELDS = [
  personalStep,
  accountStep,
  passwordStep,
  profileStep,
].map(step => Object.keys(step.shape)) as (keyof RegisterInput)[][]

export type RegisterInput = z.infer<typeof registerSchema>

export type RegisterPayload = Omit<
  RegisterInput,
  'confirmPassword' | 'birthdate'
> & {
  birthdate: string
}
