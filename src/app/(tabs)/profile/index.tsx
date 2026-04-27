import { View, Text } from 'react-native'
import { useAuthStore } from '@/features/auth/store/authStore'
import { deleteToken } from '@/shared/lib/secureStore'
import { Button } from '@/shared/components/Button'

export default function ProfileScreen() {
  const logout = useAuthStore(s => s.logout)

  async function handleLogout() {
    await deleteToken()
    logout()
  }

  return (
    <View className="flex-1 bg-black px-6 pt-6">
      <Text className="text-2xl font-bold text-white mb-8">Perfil</Text>
      <Button label="Sair" onPress={handleLogout} variant="secondary" />
    </View>
  )
}
