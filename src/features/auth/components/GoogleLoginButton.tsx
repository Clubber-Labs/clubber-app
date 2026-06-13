import { Pressable, Text, ActivityIndicator } from 'react-native'
import { useSocialLogin } from '../hooks/useSocialLogin'
import { GoogleGIcon } from './GoogleGIcon'
import { colors } from '@/shared/theme'

export function GoogleLoginButton() {
  const { mutate, isPending } = useSocialLogin('google')

  return (
    <Pressable
      onPress={() => mutate()}
      disabled={isPending}
      className="rounded-lg py-3 px-6 bg-content flex-row gap-2 items-center justify-center"
    >
      {isPending ? (
        <ActivityIndicator size="small" color={colors.surface} />
      ) : (
        <GoogleGIcon size={18} />
      )}
      <Text className="font-semibold text-base text-background">
        {isPending ? 'Conectando…' : 'Continuar com Google'}
      </Text>
    </Pressable>
  )
}
