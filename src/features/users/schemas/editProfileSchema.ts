import { z } from 'zod'
import { PHONE_MAX_DIGITS } from '@/shared/utils/masks'
import {
  MAX_PREFERRED_CATEGORIES,
  MAX_PREFERRED_INTERESTS,
  MIN_PREFERRED_CATEGORIES,
} from '@/shared/utils/rolePreferences'
import { NAME_REGEX } from '@/shared/utils/name'
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEX,
} from '@/shared/utils/username'

export const editProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(4, 'auth.errors.nameMin')
    .max(25, 'auth.errors.nameMax')
    .regex(NAME_REGEX, 'auth.errors.lettersOnly'),
  lastname: z
    .string()
    .trim()
    .min(4, 'auth.errors.lastnameMin')
    .max(55, 'auth.errors.lastnameMax')
    .regex(NAME_REGEX, 'auth.errors.lettersOnly'),
  username: z
    .string()
    .min(USERNAME_MIN_LENGTH, 'auth.errors.usernameMin')
    .max(USERNAME_MAX_LENGTH, 'auth.errors.usernameMax')
    .regex(USERNAME_REGEX, 'auth.errors.usernameFormat'),
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
    .max(MAX_PREFERRED_CATEGORIES, 'auth.errors.categoriesMax'),
  preferredSubcategories: z
    .array(z.string())
    .max(MAX_PREFERRED_INTERESTS, 'auth.errors.subcategoriesMax'),
})

export type EditProfileInput = z.infer<typeof editProfileSchema>
