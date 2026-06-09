import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'

type Props = {
  isLoggingIn: boolean
  loginError: string | null
  onEnter: () => void
  onGoToLogin: () => void
}

export function StepSuccess({
  isLoggingIn,
  loginError,
  onEnter,
  onGoToLogin,
}: Props) {
  return (
    <View className="gap-6 items-center pt-4">
      <View className="w-16 h-16 rounded-full bg-green-600/20 items-center justify-center">
        <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
      </View>

      <View className="gap-1">
        <Text className="text-2xl font-bold text-white text-center">
          Senha redefinida!
        </Text>
        <Text className="text-sm text-zinc-400 text-center">
          Sua senha foi atualizada com sucesso.
        </Text>
      </View>

      <View className="w-full gap-3">
        <FormError message={loginError} />
        <Button
          label={isLoggingIn ? 'Entrando...' : 'Entrar no app'}
          onPress={onEnter}
          loading={isLoggingIn}
        />
        {loginError && (
          <Button
            label="Ir para o login"
            onPress={onGoToLogin}
            variant="secondary"
          />
        )}
      </View>
    </View>
  )
}
