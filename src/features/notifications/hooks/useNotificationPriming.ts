import { useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { useConfirm } from '@/shared/lib/confirm'
import { syncConsentMirror } from '@/features/privacy/lib/consentMirror'
import { enablePush } from '../lib/pushRegistration'

const ASKED_KEY = 'clubber-push-priming-v1'

/**
 * Priming de notificações, disparado depois da primeira ação com peso social
 * (confirmar presença, seguir alguém, entrar num rolê) — aí existe algo sobre
 * o que notificar, e o pedido faz sentido pra quem recebe.
 *
 * Nunca no cold start nem no onboarding: no iOS o prompt do sistema aparece uma
 * única vez, e gastá-lo sem contexto é uma recusa que só os Ajustes desfazem.
 */
export function useNotificationPriming() {
  const confirm = useConfirm()

  /**
   * Silencioso quando não há o que fazer: permissão já resolvida (concedida ou
   * negada de vez) ou priming já mostrado uma vez. Nunca interrompe duas vezes.
   */
  const primeAfterSocialAction = useCallback(async (): Promise<void> => {
    const permissions = await Notifications.getPermissionsAsync()
    if (permissions.granted || !permissions.canAskAgain) return

    const alreadyAsked = await AsyncStorage.getItem(ASKED_KEY)
    if (alreadyAsked) return
    await AsyncStorage.setItem(ASKED_KEY, '1')

    const ok = await confirm({
      title: 'Saber quando algo acontecer?',
      message:
        'A gente avisa sobre convites, confirmações nos seus rolês e atividade de quem você segue.',
      confirmLabel: 'Ativar',
      cancelLabel: 'Agora não',
    })
    if (!ok) return

    await enablePush()
    // Espelha o desfecho — concedido ou negado, é estado do dispositivo.
    void syncConsentMirror()
  }, [confirm])

  return { primeAfterSocialAction }
}
