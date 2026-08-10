import { Pressable, Text } from 'react-native'
import type { Icon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

type Props = {
  icon: Icon
  label: string
  onPress: () => void
  destructive?: boolean
}

export function SheetRow({
  icon: IconComponent,
  label,
  onPress,
  destructive,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-5 py-3.5 active:bg-surface"
    >
      <IconComponent
        size={22}
        color={destructive ? colors.danger : colors.contentSecondary}
      />
      <Text
        className={`text-base ${destructive ? 'text-danger' : 'text-content-bright'}`}
      >
        {label}
      </Text>
    </Pressable>
  )
}
