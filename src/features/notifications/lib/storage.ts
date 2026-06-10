import * as SecureStore from 'expo-secure-store'

// Push token e geohash são sensíveis (o token permite empurrar pro device; o
// geohash deriva da posição do usuário) — SecureStore, nunca AsyncStorage.
const PUSH_TOKEN_KEY = 'notif_push_token_registered'
const LAST_GEOHASH_KEY = 'notif_location_last_geohash'
const LAST_SENT_AT_KEY = 'notif_location_last_sent_at'

export const saveRegisteredPushToken = (token: string) =>
  SecureStore.setItemAsync(PUSH_TOKEN_KEY, token)
export const getRegisteredPushToken = () =>
  SecureStore.getItemAsync(PUSH_TOKEN_KEY)
export const deleteRegisteredPushToken = () =>
  SecureStore.deleteItemAsync(PUSH_TOKEN_KEY)

export const saveLastLocationSync = (geohash: string, sentAtMs: number) =>
  Promise.all([
    SecureStore.setItemAsync(LAST_GEOHASH_KEY, geohash),
    SecureStore.setItemAsync(LAST_SENT_AT_KEY, String(sentAtMs)),
  ])

export const getLastLocationSync = async (): Promise<{
  geohash: string
  sentAtMs: number
} | null> => {
  const [geohash, sentAt] = await Promise.all([
    SecureStore.getItemAsync(LAST_GEOHASH_KEY),
    SecureStore.getItemAsync(LAST_SENT_AT_KEY),
  ])
  if (!geohash || !sentAt) return null
  const sentAtMs = Number(sentAt)
  if (!Number.isFinite(sentAtMs)) return null
  return { geohash, sentAtMs }
}

export const deleteLastLocationSync = () =>
  Promise.all([
    SecureStore.deleteItemAsync(LAST_GEOHASH_KEY),
    SecureStore.deleteItemAsync(LAST_SENT_AT_KEY),
  ])

// Direito ao esquecimento: chamado no endSession (logout/conta excluída).
export const clearNotificationStorage = async () => {
  await Promise.all([deleteRegisteredPushToken(), deleteLastLocationSync()])
}
