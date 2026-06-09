import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'account_recovery_v1'

// Marker local gravado ao desativar/excluir. Sobrevive ao endSession (não é
// chave de SecureStore nem do consentStore) e é amarrado ao userId pra não
// disparar o "bem-vindo de volta" no login de outra conta no mesmo device.
export type AccountRecovery = {
  userId: string
  status: 'DEACTIVATED' | 'PENDING_DELETION'
  scheduledDeletionAt: string | null
}

export async function setAccountRecovery(rec: AccountRecovery): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(rec))
}

export async function getAccountRecovery(): Promise<AccountRecovery | null> {
  const raw = await AsyncStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AccountRecovery
  } catch {
    return null
  }
}

export async function clearAccountRecovery(): Promise<void> {
  await AsyncStorage.removeItem(KEY)
}
