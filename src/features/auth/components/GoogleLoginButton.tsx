import { Pressable, Text, ActivityIndicator } from 'react-native'
import { useSocialLogin } from '../hooks/useSocialLogin'
import { GoogleGIcon } from './GoogleGIcon'

export function GoogleLoginButton() {
  const { mutate, isPending } = useSocialLogin('google')

  return (
    <Pressable
      onPress={() => mutate()}
      disabled={isPending}
      className="rounded-lg py-3 px-6 bg-white flex-row gap-2 items-center justify-center"
    >
      {isPending ? (
        <ActivityIndicator size="small" color="#18181b" />
      ) : (
        <GoogleGIcon size={18} />
      )}
      <Text className="font-semibold text-base text-zinc-900">
        {isPending ? 'Conectando…' : 'Continuar com Google'}
      </Text>
    </Pressable>
  )
}
