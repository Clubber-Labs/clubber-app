import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SheetModal } from '@/shared/components/SheetModal'
import { openDocument } from '@/shared/lib/openDocument'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import { CONSENT_VERSION } from '../services/consentService'

const DISMISSED_KEY = 'clubber-policy-notice-dismissed-v1'
const PRIVACY_URL = 'https://clubber.social/privacidade'

/**
 * Política atualizada: AVISO, não muro.
 *
 * Não bloqueia, não exige scroll até o fim, não pede aceite pra continuar
 * usando — era exatamente esse comportamento que a mudança do backend
 * eliminou. Dispensado uma vez, não volta pra mesma versão.
 */
export function PolicyUpdateNotice() {
  const { data: profile } = useMyProfile()
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(DISMISSED_KEY)
      .then(setDismissedVersion)
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const acceptedVersion = profile?.consent?.version
  const outdated =
    !!acceptedVersion &&
    acceptedVersion !== CONSENT_VERSION &&
    dismissedVersion !== CONSENT_VERSION

  function dismiss() {
    setDismissedVersion(CONSENT_VERSION)
    void AsyncStorage.setItem(DISMISSED_KEY, CONSENT_VERSION)
  }

  return (
    <SheetModal visible={loaded && outdated} onClose={dismiss}>
      <View className="px-5 pt-2 pb-6 gap-3">
        <Text className="text-xl font-bold text-content">
          Atualizamos nossa Política de Privacidade
        </Text>
        <Text className="text-sm text-content-muted leading-5">
          Continuamos usando seus dados para as mesmas finalidades. Você pode
          ler o que mudou e ajustar suas escolhas quando quiser em Perfil →
          Privacidade.
        </Text>

        <Pressable
          onPress={() => openDocument(PRIVACY_URL)}
          className="py-3 active:opacity-70"
        >
          <Text className="text-brand-text text-sm font-medium">
            Ler a política
          </Text>
        </Pressable>

        <Pressable
          onPress={dismiss}
          className="bg-surface border border-line-strong rounded-full py-4 items-center active:opacity-80"
        >
          <Text className="text-content font-semibold text-base">Entendi</Text>
        </Pressable>
      </View>
    </SheetModal>
  )
}
