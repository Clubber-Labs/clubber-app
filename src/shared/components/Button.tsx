import { Pressable, Text, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import { colors } from '@/shared/theme'

type Variant = 'primary' | 'secondary' | 'destructive' | 'neutral'

type Props = {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: Variant
  // Ícone opcional à esquerda do label (oculto enquanto carrega).
  icon?: ComponentProps<typeof Ionicons>['name']
}

const containerStyles: Record<Variant, string> = {
  // Primário neutro (identidade A): branco cheio com texto escuro — o pop vem
  // do contraste, não de cor de marca. Sem gradiente em botão, nunca.
  primary: 'bg-content',
  secondary: 'border border-line-strong',
  // Vermelho igual ao botão destrutivo do ConfirmDialog.
  destructive: 'bg-danger-strong',
  // Cinza cheio (surface-elevated) — secundário sólido, sem puxar pro violeta.
  neutral: 'bg-surface-elevated',
}

const textStyles: Record<Variant, string> = {
  primary: 'text-background',
  secondary: 'text-content-secondary',
  destructive: 'text-content',
  neutral: 'text-content',
}

const iconColors: Record<Variant, string> = {
  primary: colors.background,
  secondary: colors.contentSecondary,
  destructive: colors.content,
  neutral: colors.content,
}

export function Button({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  icon,
}: Props) {
  const base = 'rounded-lg py-3 px-6 items-center justify-center flex-row gap-2'

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      className={`${base} ${containerStyles[variant]} ${disabled && !loading ? 'opacity-40' : ''}`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary'
              ? colors.background
              : variant === 'secondary'
                ? colors.lineStrong
                : colors.content
          }
        />
      ) : (
        icon && <Ionicons name={icon} size={18} color={iconColors[variant]} />
      )}
      <Text className={`font-semibold text-base ${textStyles[variant]}`}>
        {label}
      </Text>
    </Pressable>
  )
}
