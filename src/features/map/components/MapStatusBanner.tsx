import { Pressable, View, Text } from 'react-native'
import { WarningCircleIcon, InfoIcon, type Icon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

type Props = {
  message: string
  variant?: 'error' | 'info'
  /** Sobrescreve o ícone do variant (ex.: GPS desligado). */
  icon?: Icon
  /** Distância do topo. Sem isto, fica na altura padrão dos avisos do mapa. */
  top?: number
  /** Com onPress a faixa vira tocável — use quando houver o que resolver. */
  onPress?: () => void
}

export function MapStatusBanner({
  message,
  variant = 'info',
  icon,
  top,
  onPress,
}: Props) {
  const isError = variant === 'error'
  const StatusIcon = icon ?? (isError ? WarningCircleIcon : InfoIcon)
  const Container = onPress ? Pressable : View

  return (
    <Container
      onPress={onPress}
      className={`absolute ${top === undefined ? 'top-16' : ''} self-center max-w-[92%] px-3 py-2 rounded-lg border flex-row items-center gap-1.5 bg-surface/90 border-line-strong ${
        onPress ? 'active:opacity-70' : ''
      }`}
      style={top === undefined ? undefined : { top }}
    >
      <StatusIcon size={14} color={colors.content} weight="fill" />
      <Text className="shrink text-xs text-content text-center leading-4">
        {message}
      </Text>
    </Container>
  )
}
