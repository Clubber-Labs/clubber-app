import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CloudSlashIcon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

type Props = {
  onRetry: () => void
}

// Mostrada no boot quando /users/me não pôde ser validado por rede/5xx (não é
// sessão inválida — não desloga). Overlay full-screen com retry.
export function SessionUnavailable({ onRetry }: Props) {
  const { t } = useTranslation()
  return (
    <View className="absolute inset-0 bg-background items-center justify-center px-8 gap-4">
      <View className="w-16 h-16 rounded-full bg-surface items-center justify-center">
        <CloudSlashIcon size={32} color={colors.brandEmphasis} />
      </View>
      <Text className="text-content font-semibold text-lg text-center">
        {t('auth.sessionUnavailable.title')}
      </Text>
      <Text className="text-content-muted text-sm text-center leading-5">
        {t('auth.sessionUnavailable.message')}
      </Text>
      <Pressable
        onPress={onRetry}
        className="mt-2 bg-brand rounded-full px-6 py-3"
        accessibilityLabel={t('common.retry')}
      >
        <Text className="text-content font-semibold">{t('common.retry')}</Text>
      </Pressable>
    </View>
  )
}
