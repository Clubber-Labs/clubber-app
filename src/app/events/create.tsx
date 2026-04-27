import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { EventCreateForm } from '@/features/events/components/EventCreateForm'

export default function CreateEventScreen() {
  const router = useRouter()

  return (
    <View className="flex-1 bg-black">
      <View className="flex-row items-center justify-between px-4 pt-12 pb-3 border-b border-zinc-800">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <Ionicons name="close" size={24} color="#f4f4f5" />
        </Pressable>
        <Text className="text-base font-semibold text-white">
          Novo evento
        </Text>
        <View className="w-10" />
      </View>

      <EventCreateForm />
    </View>
  )
}
