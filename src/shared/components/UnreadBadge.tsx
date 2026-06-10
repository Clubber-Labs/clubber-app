import { View, Text } from 'react-native'

type Props = {
  count: number
}

export function UnreadBadge({ count }: Props) {
  if (count <= 0) return null
  return (
    <View className="bg-violet-600 rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center">
      <Text className="text-white text-xs font-bold">
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  )
}
