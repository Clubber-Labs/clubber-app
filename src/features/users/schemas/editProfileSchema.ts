import { z } from 'zod'

const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s]+$/

export const editProfileSchema = z.object({
  name: z
    .string()
    .min(4, 'Mínimo 4 caracteres')
    .max(25, 'Máximo 25 caracteres')
    .regex(NAME_REGEX, 'Apenas letras'),
  lastname: z
    .string()
    .min(4, 'Mínimo 4 caracteres')
    .max(55, 'Máximo 55 caracteres')
    .regex(NAME_REGEX, 'Apenas letras'),
  username: z
    .string()
    .min(4, 'Mínimo 4 caracteres')
    .max(25, 'Máximo 25 caracteres'),
  phone: z
    .string()
    .min(10, 'Mínimo 10 dígitos')
    .max(11, 'Máximo 11 dígitos')
    .regex(/^\d+$/, 'Apenas números'),
  bio: z.string().max(255, 'Máximo 255 caracteres'),
  isPrivate: z.boolean(),
  birthdate: z.date().optional(),
  preferredCategories: z.array(z.string()).max(10, 'No máximo 10 categorias'),
})

export type EditProfileInput = z.infer<typeof editProfileSchema>
