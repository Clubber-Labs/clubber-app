import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CheckCircleIcon } from 'phosphor-react-native'
import { Button } from '@/shared/components/Button'
import { colors } from '@/shared/theme'

type Props = {
  title: string
  message: string
  doneLabel?: string
  loading?: boolean
  onDone: () => void
}

// Estado de confirmação pós-ação (desativar/excluir). Não referencia o perfil —
// o cache de /me já pode ter sido limpo pelo endSession (no onDone).
export function AccountExitSuccess({
  title,
  message,
  doneLabel,
  loading,
  onDone,
}: Props) {
  const { t } = useTranslation()
  return (
    <View className="flex-1 bg-background px-6 justify-center gap-8">
      <View className="items-center gap-4">
        <CheckCircleIcon size={56} color={colors.brandText} />
        <Text className="text-content text-2xl font-bold text-center">
          {title}
        </Text>
        <Text className="text-content-muted text-base text-center leading-6">
          {message}
        </Text>
      </View>
      <Button
        label={doneLabel ?? t('account.done')}
        onPress={onDone}
        loading={loading}
      />
    </View>
  )
}
