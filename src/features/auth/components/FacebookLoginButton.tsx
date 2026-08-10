import { Pressable, Text, ActivityIndicator } from 'react-native'
import { FacebookLogoIcon } from 'phosphor-react-native'
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
        <FacebookLogoIcon size={20} color={colors.content} weight="fill" />
      )}
      <Text className="font-semibold text-base text-content">
        {isPending ? 'Conectando…' : 'Continuar com Facebook'}
      </Text>
    </Pressable>
  )
}
