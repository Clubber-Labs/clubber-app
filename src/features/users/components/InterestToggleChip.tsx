import { Pressable, Text } from 'react-native'
import { CheckIcon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

type Props = {
  label: string
  active: boolean
  disabled?: boolean
  onPress: () => void
}

// Chip da folha de interesses: ativo = pílula branca cheia com check (a mesma
// linguagem do botão primário); inativo = contorno. No teto, os inativos
// apagam em vez de avisar.
export function InterestToggleChip({
  label,
  active,
  disabled,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      className={`flex-row items-center gap-1 rounded-full px-3 py-1.5 ${
        active ? 'bg-content' : 'border border-line-strong'
      } ${disabled ? 'opacity-40' : ''}`}
    >
      {active && (
        <CheckIcon size={12} weight="bold" color={colors.background} />
      )}
      <Text
        className={`text-xs font-semibold ${
          active ? 'text-background' : 'text-content-tertiary'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  )
}
