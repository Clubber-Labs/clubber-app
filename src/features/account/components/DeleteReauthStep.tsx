import { View, Text, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { colors } from '@/shared/theme'

type Props = {
  hasPassword: boolean
  password: string
  onPasswordChange: (p: string) => void
  error: string | null
  submitting: boolean
  onConfirm: () => void
  onBack: () => void
}

export function DeleteReauthStep({
  hasPassword,
  password,
  onPasswordChange,
  error,
  submitting,
  onConfirm,
  onBack,
}: Props) {
  const canSubmit = hasPassword ? password.trim().length > 0 : true

  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-content text-xl font-bold">
          Confirme que é você
        </Text>
        <Text className="text-content-muted text-sm leading-5">
          {hasPassword
            ? 'Digite sua senha para excluir a conta.'
            : 'Sua sessão confirma sua identidade — você entrou com Google ou Facebook.'}
        </Text>
      </View>

      {hasPassword ? (
        <View className="gap-1.5">
          <Text className="text-content-muted text-xs font-medium uppercase tracking-wider">
            Senha
          </Text>
          <TextInput
            className={`border ${error ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 text-base text-content`}
            placeholder="Sua senha"
            placeholderTextColor={colors.contentSubtle}
            onChangeText={onPasswordChange}
            value={password}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />
        </View>
      ) : (
        <View className="flex-row items-center gap-2 bg-surface-sunken border border-line rounded-xl px-4 py-3">
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={colors.brandText}
          />
          <Text className="text-content-muted text-sm flex-1">
            Nenhuma senha necessária para esta conta.
          </Text>
        </View>
      )}

      <FormError message={error} />

      <View className="gap-3 mt-2">
        <Button
          label="Excluir minha conta"
          variant="destructive"
          onPress={onConfirm}
          disabled={!canSubmit || submitting}
          loading={submitting}
        />
        <Button label="Voltar" onPress={onBack} variant="secondary" />
      </View>
    </View>
  )
}
