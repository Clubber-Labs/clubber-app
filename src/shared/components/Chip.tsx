import { Pressable, Text } from 'react-native'
import { CheckIcon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

type Props = {
  label: string
  active: boolean
  onPress: () => void
  disabled?: boolean
  // Experimento "cor é informação": matiz do chip ATIVO (ex.: categoria).
  // Ausente, o ativo usa o neutro padrão.
  activeColors?: { bg: string; border: string; text: string }
}

// Chip selecionável único do app — filtros (status/categorias), seletores de
// categoria/interesse, chips sobre o mapa. Ativo = fundo da marca + check;
// inativo = surface neutro. Forma padrão: rounded-lg. Quem agrupa decide o
// layout (scroll horizontal ou flex-wrap).
export function Chip({
  label,
  active,
  onPress,
  disabled,
  activeColors,
}: Props) {
  const hue = active ? activeColors : undefined
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      className={`flex-row items-center gap-1 rounded-lg border px-3.5 py-2 ${
        active && !hue
          ? 'bg-brand border-brand'
          : 'bg-surface border-line-strong'
      } ${disabled ? 'opacity-40' : ''}`}
      style={
        hue ? { backgroundColor: hue.bg, borderColor: hue.border } : undefined
      }
    >
      {active && (
        <CheckIcon size={14} color={hue ? hue.text : colors.content} />
      )}
      <Text
        className={`text-[13px] font-semibold ${
          active ? 'text-content' : 'text-content-tertiary'
        }`}
        style={hue ? { color: hue.text } : undefined}
      >
        {label}
      </Text>
    </Pressable>
  )
}
