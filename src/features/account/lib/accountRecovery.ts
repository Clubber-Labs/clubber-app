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

// Best-effort: o marker é só UX (welcome-back). Uma falha de storage nunca pode
// quebrar o fluxo de saída da conta nem o login.
export async function setAccountRecovery(rec: AccountRecovery): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(rec))
  } catch {
    // ignora — segue sem marker
  }
}

export async function getAccountRecovery(): Promise<AccountRecovery | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as AccountRecovery
  } catch {
    return null
  }
}

export async function clearAccountRecovery(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY)
  } catch {
    // ignora
  }
}
