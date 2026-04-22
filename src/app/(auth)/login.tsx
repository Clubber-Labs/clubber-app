import { View } from 'react-native'
import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginScreen() {
  return (
    <View className="flex-1 bg-white justify-center px-6">
      <LoginForm />
    </View>
  )
}
