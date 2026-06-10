import { useEffect, useRef } from 'react'
import {
  useConsentStore,
  selectCanSendPush,
} from '@/features/privacy/store/consentStore'
import { syncPushRegistration, disablePush } from '../lib/pushRegistration'

// Mantém o registro do device alinhado ao consentimento. Com consentimento:
// sincroniza em silêncio (sem prompt do SO — isso é ação do toggle na tela de
// configurações). Transição consentido → revogado (inclusive vinda do servidor
// na hidratação): remove o device (revogação efetiva, LGPD).
export function usePushRegistration() {
  const canSendPush = useConsentStore(selectCanSendPush)
  const previous = useRef(canSendPush)

  useEffect(() => {
    if (canSendPush) {
      syncPushRegistration().catch(() => {
        // Silencioso: sem rede agora, o próximo foreground tenta de novo.
      })
    } else if (previous.current) {
      disablePush().catch(() => {})
    }
    previous.current = canSendPush
  }, [canSendPush])
}
