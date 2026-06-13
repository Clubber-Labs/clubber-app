import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { colors } from '@/shared/theme'

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
      <View className="w-16 h-16 rounded-full bg-success-strong/20 items-center justify-center">
        <Ionicons name="checkmark-circle" size={48} color={colors.success} />
      </View>

      <View className="gap-1">
        <Text className="text-2xl font-bold text-content text-center">
          Senha redefinida!
        </Text>
        <Text className="text-sm text-content-muted text-center">
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
