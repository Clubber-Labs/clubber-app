import { View, Text } from 'react-native'

type Props = {
  message: string
}

export function ProfileEmpty({ message }: Props) {
  return (
    <View className="flex-1 bg-black items-center justify-center px-6">
      <Text className="text-zinc-400 text-center">{message}</Text>
    </View>
  )
}
