import { z } from 'zod'
import { PHONE_MAX_DIGITS } from '@/shared/utils/masks'
import { MIN_PREFERRED_CATEGORIES } from '@/shared/utils/rolePreferences'

const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s]+$/

export const editProfileSchema = z.object({
  name: z
    .string()
    .min(4, 'auth.errors.nameMin')
    .max(25, 'auth.errors.nameMax')
    .regex(NAME_REGEX, 'auth.errors.lettersOnly'),
  lastname: z
    .string()
    .min(4, 'auth.errors.lastnameMin')
    .max(55, 'auth.errors.lastnameMax')
    .regex(NAME_REGEX, 'auth.errors.lettersOnly'),
  username: z
    .string()
    .min(4, 'auth.errors.usernameMin')
    .max(25, 'auth.errors.usernameMax'),
  phone: z
    .string()
    .min(10, 'auth.errors.phoneMin')
    .max(PHONE_MAX_DIGITS, 'auth.errors.phoneMax')
    .regex(/^\d+$/, 'auth.errors.digitsOnly'),
  bio: z.string().max(255, 'auth.errors.bioMax'),
  isPrivate: z.boolean(),
  birthdate: z.date().optional(),
  preferredCategories: z
    .array(z.string())
    .min(MIN_PREFERRED_CATEGORIES, 'auth.errors.categoriesMin')
    .max(10, 'auth.errors.categoriesMax'),
  preferredSubcategories: z
    .array(z.string())
    .max(30, 'auth.errors.subcategoriesMax'),
})

export type EditProfileInput = z.infer<typeof editProfileSchema>
