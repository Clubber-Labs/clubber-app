import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'
import { InboxList } from '@/features/chat/components/InboxList'

export default function InboxScreen() {
  const router = useRouter()
  const myId = useAuthStore(s => s.userId)

  if (!myId) return <View className="flex-1 bg-black" />

  const goNew = () => router.push('/conversations/new')

  return (
    <View className="flex-1 bg-black">
      <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
        <Text className="text-white text-2xl font-bold">Mensagens</Text>
      </View>

      <InboxList
        myId={myId}
        onOpen={id => router.push(`/conversations/${id}`)}
        onNew={goNew}
      />

      <Pressable
        onPress={goNew}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-violet-600 items-center justify-center"
        accessibilityLabel="Nova conversa"
      >
        <Ionicons name="create" size={24} color="#ffffff" />
      </Pressable>
    </View>
  )
}
