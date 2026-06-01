import { toLocalIsoDate } from '@/shared/utils/dateFormat'
import type { UserProfile } from '@/shared/types'
import type { UpdateMePayload } from '../services/usersService'
import type { EditProfileInput } from '../schemas/editProfileSchema'

export function buildProfilePatch(
  profile: UserProfile,
  form: EditProfileInput,
): UpdateMePayload {
  const patch: UpdateMePayload = {}

  if (form.name !== profile.name) patch.name = form.name
  if (form.lastname !== profile.lastname) patch.lastname = form.lastname
  if (form.username !== profile.username) patch.username = form.username
  if (form.phone !== (profile.phone ?? '')) patch.phone = form.phone
  if (form.bio !== (profile.bio ?? '')) patch.bio = form.bio
  if (form.isPrivate !== profile.isPrivate) patch.isPrivate = form.isPrivate

  // preferredCategories: PUT substitui o estado completo. Só inclui a chave se
  // a seleção mudou — incluir (mesmo []) recria a lista; omitir mantém a atual.
  // Comparação ordem-insensível pois a ordem dos chips não é semântica.
  if (!sameCategories(form.preferredCategories, profile.preferredCategories ?? []))
    patch.preferredCategories = form.preferredCategories

  // form.birthdate undefined = user não tocou no campo; não sobrescreve.
  if (form.birthdate) {
    const formDate = toLocalIsoDate(form.birthdate)
    const profileDate = profile.birthdate
      ? profile.birthdate.split('T')[0]
      : ''
    if (formDate !== profileDate) patch.birthdate = formDate
  }

  return patch
}

export function isPatchEmpty(patch: UpdateMePayload): boolean {
  return Object.keys(patch).length === 0
}

function sameCategories(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const sortedB = [...b].sort()
  return [...a].sort().every((value, i) => value === sortedB[i])
}
