import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const NOTIFY_RADIUS_MIN_KM = 2
export const NOTIFY_RADIUS_MAX_KM = 50
// Default do servidor (coluna Prisma). GET /users/me não expõe o campo, então
// o último valor salvo vive aqui; o PATCH é o write de autoridade — trocar de
// device mostra o default até o próximo ajuste.
export const NOTIFY_RADIUS_DEFAULT_KM = 10

type NotificationPrefsState = {
  notifyRadiusKm: number
  setRadius: (km: number) => void
  reset: () => void
}

export const useNotificationPrefsStore = create<NotificationPrefsState>()(
  persist(
    set => ({
      notifyRadiusKm: NOTIFY_RADIUS_DEFAULT_KM,
      setRadius: km => set({ notifyRadiusKm: km }),
      reset: () => set({ notifyRadiusKm: NOTIFY_RADIUS_DEFAULT_KM }),
    }),
    {
      name: 'connectai-notification-prefs-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
