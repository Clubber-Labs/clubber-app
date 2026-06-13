import { View, Text } from 'react-native'

type Props = {
  message: string
}

export function ProfileEmpty({ message }: Props) {
  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Text className="text-content-muted text-center">{message}</Text>
    </View>
  )
}
