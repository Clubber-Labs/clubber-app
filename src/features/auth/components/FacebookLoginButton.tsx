import { Pressable, Text, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSocialLogin } from '../hooks/useSocialLogin'
import { colors } from '@/shared/theme'

export function FacebookLoginButton() {
  const { mutate, isPending } = useSocialLogin('facebook')

  return (
    <Pressable
      onPress={() => mutate()}
      disabled={isPending}
      className="rounded-lg py-3 px-6 bg-[#1877F2] flex-row gap-2 items-center justify-center"
    >
      {isPending ? (
        <ActivityIndicator size="small" color={colors.content} />
      ) : (
        <Ionicons name="logo-facebook" size={20} color={colors.content} />
      )}
      <Text className="font-semibold text-base text-content">
        {isPending ? 'Conectando…' : 'Continuar com Facebook'}
      </Text>
    </Pressable>
  )
}
