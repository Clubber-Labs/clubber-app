import { useEffect } from 'react'
import { AppState } from 'react-native'
import { useAuthStore } from '@/features/auth/store/authStore'
import { hydrateConsentRecord, syncConsentMirror } from '../lib/consentMirror'

/**
 * Mantém o registro do servidor e o espelho da permissão do SO em dia enquanto
 * houver sessão. Montado uma vez na raiz.
 *
 * O foreground é o gatilho que não pode faltar: é por ali que volta quem foi
 * aos Ajustes do sistema mudar a permissão sem passar pelo app.
 */
export function useConsentMirror() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return

    void hydrateConsentRecord()
    void syncConsentMirror()

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') void syncConsentMirror()
    })
    return () => subscription.remove()
  }, [isAuthenticated])
}
