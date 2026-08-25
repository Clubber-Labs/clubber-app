import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'
const USER_ID_KEY = 'auth_user_id'
// Persistir o último profileIncomplete conhecido garante que o AuthGuard
// não libere o feed após kill/restart sem rede (me() pode falhar e deixar
// o flag em default false, bypassando a tela de completar perfil).
const PROFILE_INCOMPLETE_KEY = 'auth_profile_incomplete'
// Flag de aparelho (sobrevive a logout de propósito): quem já viu o
// onboarding cai direto no login quando deslogado.
const ONBOARDING_SEEN_KEY = 'onboarding_seen'
// Idioma escolhido — de aparelho, como o onboarding: trocar de conta não
// devolve a interface pro idioma do sistema.
const LOCALE_PREFERENCE_KEY = 'locale_preference'

export const saveToken = (token: string) =>
  SecureStore.setItemAsync(TOKEN_KEY, token)
export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY)
export const deleteToken = () => SecureStore.deleteItemAsync(TOKEN_KEY)

export const saveRefreshToken = (token: string) =>
  SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token)
export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
export const deleteRefreshToken = () =>
  SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)

export const saveUserId = (id: string) =>
  SecureStore.setItemAsync(USER_ID_KEY, id)
export const getUserId = () => SecureStore.getItemAsync(USER_ID_KEY)
export const deleteUserId = () => SecureStore.deleteItemAsync(USER_ID_KEY)

export const saveProfileIncomplete = (value: boolean) =>
  SecureStore.setItemAsync(PROFILE_INCOMPLETE_KEY, value ? '1' : '0')
export const getProfileIncomplete = async (): Promise<boolean | null> => {
  const v = await SecureStore.getItemAsync(PROFILE_INCOMPLETE_KEY)
  if (v === null) return null
  return v === '1'
}
export const deleteProfileIncomplete = () =>
  SecureStore.deleteItemAsync(PROFILE_INCOMPLETE_KEY)

export const saveOnboardingSeen = () =>
  SecureStore.setItemAsync(ONBOARDING_SEEN_KEY, '1')
export const getOnboardingSeen = async (): Promise<boolean> =>
  (await SecureStore.getItemAsync(ONBOARDING_SEEN_KEY)) === '1'
export const deleteOnboardingSeen = () =>
  SecureStore.deleteItemAsync(ONBOARDING_SEEN_KEY)

// Token de convite aguardando sessão: o deep link abre deslogado, mas o accept
// exige auth. Vive só entre o CTA de login e a retomada na tela do convite —
// quem consome SEMPRE limpa. Nunca logar este valor.
const PENDING_INVITE_TOKEN_KEY = 'pending_invite_token'

export const savePendingInviteToken = (token: string) =>
  SecureStore.setItemAsync(PENDING_INVITE_TOKEN_KEY, token)
export const getPendingInviteToken = () =>
  SecureStore.getItemAsync(PENDING_INVITE_TOKEN_KEY)
export const deletePendingInviteToken = () =>
  SecureStore.deleteItemAsync(PENDING_INVITE_TOKEN_KEY)

export const saveLocalePreference = (locale: string) =>
  SecureStore.setItemAsync(LOCALE_PREFERENCE_KEY, locale)
export const getLocalePreference = () =>
  SecureStore.getItemAsync(LOCALE_PREFERENCE_KEY)
export const deleteLocalePreference = () =>
  SecureStore.deleteItemAsync(LOCALE_PREFERENCE_KEY)

export const saveAuthSession = (token: string, userId: string) =>
  Promise.all([saveToken(token), saveUserId(userId)])

export const clearAuthSession = () =>
  Promise.all([
    deleteToken(),
    deleteRefreshToken(),
    deleteUserId(),
    deleteProfileIncomplete(),
  ])
