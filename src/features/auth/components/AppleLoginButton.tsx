import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import { useSocialLogin } from '../hooks/useSocialLogin'

// Botão OFICIAL da Apple (compliance de marca garantida na App Review; HIG
// aceita custom, mas o nativo elimina a discussão). Ele desenha o próprio
// label, já localizado pelo sistema — por isso não há chave de i18n aqui.
export function AppleLoginButton() {
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
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
      cornerRadius={24}
      // Mesma altura dos irmãos (py-3 + text-base ≈ 48) pra pílula casar.
      style={{ height: 48 }}
      onPress={() => {
        if (!isPending) mutate()
      }}
    />
  )
}
