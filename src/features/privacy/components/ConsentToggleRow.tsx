import { Switch, Text, View } from 'react-native'
import { colors } from '@/shared/theme'

type Props = {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  isLast?: boolean
}

export function ConsentToggleRow({
  label,
  description,
  value,
  onChange,
  disabled,
  isLast,
}: Props) {
  return (
    <View
      className={`flex-row items-start py-4 px-4 ${!isLast ? 'border-b border-line' : ''}`}
    >
      {/* O texto esmaece junto: só o Switch acinzentado deixaria a linha com
          cara de ativa, e a pessoa tentaria mexer no que não responde. */}
      <View className={`flex-1 mr-4 ${disabled ? 'opacity-40' : ''}`}>
        <Text className="text-sm font-semibold text-content">{label}</Text>
        <Text className="text-xs text-content-muted mt-1 leading-4">
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        thumbColor={value ? colors.brand : colors.lineStrong}
        trackColor={{ true: colors.brandSurfaceStrong, false: colors.line }}
        ios_backgroundColor={colors.line}
      />
    </View>
  )
}
