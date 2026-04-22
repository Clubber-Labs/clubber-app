import { View } from 'react-native'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export default function RegisterScreen() {
  return (
    <View className="flex-1 bg-white justify-center px-6">
      <RegisterForm />
    </View>
  )
}
