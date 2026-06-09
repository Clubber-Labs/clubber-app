import { Pressable, Text, ActivityIndicator } from 'react-native'

type Variant = 'primary' | 'secondary' | 'destructive'

type Props = {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: Variant
}

const containerStyles: Record<Variant, string> = {
  primary: 'bg-violet-600',
  secondary: 'border border-zinc-700',
  // Vermelho igual ao botão destrutivo do ConfirmDialog.
  destructive: 'bg-red-600',
}

const textStyles: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-zinc-200',
  destructive: 'text-white',
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
      className={`${base} ${containerStyles[variant]} ${disabled && !loading ? 'opacity-40' : ''}`}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' ? '#374151' : '#fff'}
        />
      )}
      <Text className={`font-semibold text-base ${textStyles[variant]}`}>
        {label}
      </Text>
    </Pressable>
  )
}
