import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'
const USER_ID_KEY = 'auth_user_id'
// Persistir o último profileIncomplete conhecido garante que o AuthGuard
// não libere o feed após kill/restart sem rede (me() pode falhar e deixar
// o flag em default false, bypassando a tela de completar perfil).
const PROFILE_INCOMPLETE_KEY = 'auth_profile_incomplete'

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

export const saveAuthSession = (token: string, userId: string) =>
  Promise.all([saveToken(token), saveUserId(userId)])

export const clearAuthSession = () =>
  Promise.all([
    deleteToken(),
    deleteRefreshToken(),
    deleteUserId(),
    deleteProfileIncomplete(),
  ])
