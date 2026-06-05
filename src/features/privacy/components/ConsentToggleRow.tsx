import { Switch, Text, View } from 'react-native'

type Props = {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  isLast?: boolean
}

export function ConsentToggleRow({ label, description, value, onChange, disabled, isLast }: Props) {
  return (
    <View className={`flex-row items-start py-4 px-4 ${!isLast ? 'border-b border-zinc-800' : ''}`}>
      <View className="flex-1 mr-4">
        <Text className="text-sm font-semibold text-white">{label}</Text>
        <Text className="text-xs text-zinc-400 mt-1 leading-4">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        thumbColor={value ? '#7c3aed' : '#3f3f46'}
        trackColor={{ true: '#4c1d95', false: '#27272a' }}
        ios_backgroundColor="#27272a"
      />
    </View>
  )
}
