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
        active ? 'bg-violet-600' : 'bg-zinc-800'
      } ${disabled ? 'opacity-40' : ''}`}
    >
      <Text
        className={`text-sm ${active ? 'text-white font-medium' : 'text-zinc-200'}`}
      >
        {label}
      </Text>
    </Pressable>
  )
}
