import { useCallback, useEffect, useState } from 'react'
import { AppState } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Location from 'expo-location'

export type OsPermission = 'granted' | 'denied' | 'undetermined'

function toStatus(granted: boolean, canAskAgain: boolean): OsPermission {
  if (granted) return 'granted'
  return canAskAgain ? 'undetermined' : 'denied'
}

// Status das permissões do SO (push + localização), re-checado ao voltar do
// background — cobre o usuário indo aos ajustes do sistema e voltando.
export function useOsPermissions() {
  const [push, setPush] = useState<OsPermission>('undetermined')
  const [location, setLocation] = useState<OsPermission>('undetermined')

  const refresh = useCallback(async () => {
    const [p, l] = await Promise.all([
      Notifications.getPermissionsAsync(),
      Location.getForegroundPermissionsAsync(),
    ])
    setPush(toStatus(p.granted, p.canAskAgain))
    setLocation(toStatus(l.granted, l.canAskAgain))
  }, [])

  useEffect(() => {
    void refresh()
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') void refresh()
    })
    return () => sub.remove()
  }, [refresh])

  return { push, location, refresh }
}
