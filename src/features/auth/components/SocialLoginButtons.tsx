import { View } from 'react-native'
import { GoogleLoginButton } from './GoogleLoginButton'
import { AppleLoginButton } from './AppleLoginButton'

export function SocialLoginButtons() {
  return (
    <View className="gap-3">
      <GoogleLoginButton />
      <AppleLoginButton />
    </View>
  )
}
