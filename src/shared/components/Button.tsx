import { Pressable, Text, ActivityIndicator } from 'react-native'

type Props = {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export function Button({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
}: Props) {
  const base = 'rounded-lg py-3 px-6 items-center justify-center flex-row gap-2'
  const styles =
    variant === 'primary'
      ? `${base} bg-violet-600`
      : `${base} border border-zinc-700`

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${styles} ${disabled && !loading ? 'opacity-40' : ''}`}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#fff' : '#374151'}
        />
      )}
      <Text
        className={`font-semibold text-base ${variant === 'primary' ? 'text-white' : 'text-zinc-200'}`}
      >
        {label}
      </Text>
    </Pressable>
  )
}
