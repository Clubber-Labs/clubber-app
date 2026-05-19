import { View } from 'react-native'
import { GoogleLoginButton } from './GoogleLoginButton'
import { FacebookLoginButton } from './FacebookLoginButton'

export function SocialLoginButtons() {
  return (
    <View className="gap-3">
      <GoogleLoginButton />
      <FacebookLoginButton />
    </View>
  )
}
