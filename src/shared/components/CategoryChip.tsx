import { Pressable, Text } from 'react-native'

type Props = {
  label: string
  active: boolean
  onPress: () => void
  disabled?: boolean
}

export function CategoryChip({ label, active, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`px-4 py-2 rounded-full ${
        active ? 'bg-brand' : 'bg-surface-elevated'
      } ${disabled ? 'opacity-40' : ''}`}
    >
      <Text
        className={`text-sm ${active ? 'text-content font-medium' : 'text-content-secondary'}`}
      >
        {label}
      </Text>
    </Pressable>
  )
}
