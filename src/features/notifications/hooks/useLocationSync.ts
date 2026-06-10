import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'
import {
  useConsentStore,
  selectCanUseLocation,
} from '@/features/privacy/store/consentStore'
import { syncLocationOnce } from '../lib/locationSync'
import { deleteLastLocationSync } from '../lib/storage'

// Gate duplo (LGPD): consentimento locationPrecise E permissão do SO já
// concedida (checada dentro do sync — o prompt só acontece no toggle da tela
// de configurações). Sincroniza no boot e a cada foreground, com throttle.
// Revogação para a coleta na hora (efeito desarma) e limpa o throttle local —
// o servidor apaga a localização pelo fluxo de consentimento.
export function useLocationSync() {
  const canUseLocation = useConsentStore(selectCanUseLocation)
  const previous = useRef(canUseLocation)

  useEffect(() => {
    if (!canUseLocation) {
      if (previous.current) void deleteLastLocationSync()
      previous.current = canUseLocation
      return
    }
    previous.current = canUseLocation

    void syncLocationOnce()
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') void syncLocationOnce()
    })
    return () => sub.remove()
  }, [canUseLocation])
}
