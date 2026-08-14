import { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ConsentedLocationStatus } from '@/features/privacy/hooks/useConsentedLocation'

const DISMISSED_KEY = 'clubber-map-location-invite-v1'

/**
 * Visibilidade do convite de localização no mapa.
 *
 * Recebe o status do gate da tela em vez de abrir o próprio: dois
 * useUserLocation seriam dois estados independentes, e o card poderia convidar
 * alguém que já concedeu.
 *
 * Só aparece em 'askable' — ou seja, quando o prompt do sistema ainda pode ser
 * mostrado. Quem negou de vez ('denied') não ganha um convite que não leva a
 * nada; quem revogou resolve na tela de privacidade, não aqui.
 */
export function useLocationInvite(status: ConsentedLocationStatus) {
  // null = ainda lendo o storage. Evita o card piscar antes de sabermos que
  // já foi dispensado.
  const [dismissed, setDismissed] = useState<boolean | null>(null)

  useEffect(() => {
    AsyncStorage.getItem(DISMISSED_KEY)
      .then(value => setDismissed(!!value))
      .catch(() => setDismissed(false))
  }, [])

  const dismiss = useCallback(() => {
    setDismissed(true)
    void AsyncStorage.setItem(DISMISSED_KEY, '1')
  }, [])

  return { visible: dismissed === false && status === 'askable', dismiss }
}
