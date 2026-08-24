import { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ConsentedLocationStatus } from '@/features/privacy/hooks/useConsentedLocation'

const SEEN_KEY = 'clubber-map-location-invite-v1'

/**
 * O convite de localização aparece UMA VEZ na vida do app — na primeira vez
 * que a pessoa usa o mapa sem permissão. Depois disso, quem lembra é o banner
 * de aviso no topo, que fica enquanto faltar permissão.
 *
 * A marca de "já vi" é gravada assim que ele aparece, não quando é fechado:
 * ver é o que consome a única aparição. Fechar é só estado desta montagem, pra
 * o card não sumir no mesmo frame em que grava.
 *
 * Recebe o status do gate da tela em vez de abrir o próprio: dois
 * useUserLocation seriam dois estados independentes, e o card poderia convidar
 * alguém que já concedeu.
 */
export function useLocationInvite(status: ConsentedLocationStatus) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Só em 'askable': quem negou de vez não recebe um convite cujo botão não
    // conseguiria abrir prompt nenhum — pra esse caso existe o banner. Sair de
    // 'askable' também RECOLHE o card: a permissão pode ser concedida fora do
    // mapa (pedido de primeiro uso, Ajustes do sistema) e ele ficaria na tela
    // convidando pro que já está feito.
    if (status !== 'askable') {
      setVisible(false)
      return
    }
    let cancelled = false

    AsyncStorage.getItem(SEEN_KEY)
      .then(seen => {
        if (cancelled || seen) return
        setVisible(true)
        return AsyncStorage.setItem(SEEN_KEY, '1')
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [status])

  const hide = useCallback(() => setVisible(false), [])

  return { visible, hide }
}
