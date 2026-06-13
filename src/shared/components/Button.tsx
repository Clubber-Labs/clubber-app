import { Pressable, Text, ActivityIndicator } from 'react-native'
import { colors } from '@/shared/theme'

type Variant = 'primary' | 'secondary' | 'destructive'

type Props = {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: Variant
}

const containerStyles: Record<Variant, string> = {
  primary: 'bg-brand',
  secondary: 'border border-line-strong',
  // Vermelho igual ao botão destrutivo do ConfirmDialog.
  destructive: 'bg-danger-strong',
}

const textStyles: Record<Variant, string> = {
  primary: 'text-content',
  secondary: 'text-content-secondary',
  destructive: 'text-content',
}

export function Button({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
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
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' ? colors.lineStrong : colors.content}
        />
      )}
      <Text className={`font-semibold text-base ${textStyles[variant]}`}>
        {label}
      </Text>
    </Pressable>
  )
}
