import { useEffect, useState } from 'react'
import { ActivityIndicator, Platform, Pressable, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as AppleAuthentication from 'expo-apple-authentication'
import { useSocialLogin } from '../hooks/useSocialLogin'
import { colors } from '@/shared/theme'

// Glifo REAL da Apple (U+F8FF, private-use resolvido pela SF do sistema) —
// o AppleLogo da phosphor é mais alongado que o oficial e parecia esticado.
// Seguro aqui: o botão é iOS-only.
const APPLE_GLYPH = '\uF8FF'

// Pressable custom no lugar do AppleAuthenticationButton oficial: o nativo
// desenha o próprio label (SF, escala do sistema) e destoava do par com o
// Google — caminho previsto no plano e aceito pela HIG, desde que leve o
// glifo  e o título oficial da Apple verbatim nos 3 locales.
export function AppleLoginButton() {
  const { t } = useTranslation()
  const [available, setAvailable] = useState(false)
  const { mutate, isPending } = useSocialLogin('apple')

  // Android fica Google + email/senha (Apple via web fora de escopo). O
  // isAvailableAsync cobre iOS < 13 e builds sem a capability.
  useEffect(() => {
    if (Platform.OS !== 'ios') return
    AppleAuthentication.isAvailableAsync().then(setAvailable)
  }, [])

  if (!available) return null

  return (
    <Pressable
      onPress={() => mutate()}
      disabled={isPending}
      className="rounded-full py-3 px-6 bg-content flex-row gap-2 items-center justify-center"
    >
      {isPending ? (
        <ActivityIndicator size="small" color={colors.surface} />
      ) : (
        <Text style={{ fontSize: 20, color: colors.background }}>
          {APPLE_GLYPH}
        </Text>
      )}
      <Text className="font-semibold text-base text-background">
        {isPending
          ? t('auth.social.connecting')
          : t('auth.social.continueApple')}
      </Text>
    </Pressable>
  )
}
