import { Text, Pressable } from 'react-native'

type Props = {
  title: string
  date: string
  onPress: () => void
}

export function EventCard({ title, date, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm"
    >
      <Text className="text-lg font-bold text-gray-900">{title}</Text>
      <Text className="text-sm text-gray-500 mt-1">{date}</Text>
    </Pressable>
  )
}
