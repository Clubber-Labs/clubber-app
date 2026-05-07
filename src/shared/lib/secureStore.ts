import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'auth_token'
const USER_ID_KEY = 'auth_user_id'

export const saveToken = (token: string) =>
  SecureStore.setItemAsync(TOKEN_KEY, token)
export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY)
export const deleteToken = () => SecureStore.deleteItemAsync(TOKEN_KEY)

export const saveUserId = (id: string) =>
  SecureStore.setItemAsync(USER_ID_KEY, id)
export const getUserId = () => SecureStore.getItemAsync(USER_ID_KEY)
export const deleteUserId = () => SecureStore.deleteItemAsync(USER_ID_KEY)

export const saveAuthSession = (token: string, userId: string) =>
  Promise.all([saveToken(token), saveUserId(userId)])

export const clearAuthSession = () =>
  Promise.all([deleteToken(), deleteUserId()])
