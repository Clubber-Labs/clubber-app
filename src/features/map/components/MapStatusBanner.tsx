import { View, Text } from 'react-native'
import { WarningCircleIcon, InfoIcon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

type Props = {
  message: string
  variant?: 'error' | 'info'
}

export function MapStatusBanner({ message, variant = 'info' }: Props) {
  const isError = variant === 'error'
  const StatusIcon = isError ? WarningCircleIcon : InfoIcon
  return (
    <View className="absolute top-16 self-center px-3 py-1.5 rounded-lg border flex-row items-center gap-1.5 bg-surface/90 border-line-strong">
      <StatusIcon size={14} color={colors.content} weight="fill" />
      <Text className="text-xs text-content">{message}</Text>
    </View>
  )
}
