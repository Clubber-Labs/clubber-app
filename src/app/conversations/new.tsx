import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useBanner } from '@/shared/lib/banner'
import { getApiError, isForbiddenError } from '@/shared/lib/apiError'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useCreateConversation } from '@/features/chat/hooks/useCreateConversation'
import { PeoplePicker } from '@/features/chat/components/PeoplePicker'
import { ChatPersonRow } from '@/features/chat/components/ChatPersonRow'
import type { UserMini } from '@/shared/types'

export default function NewConversationScreen() {
  const router = useRouter()
  const showBanner = useBanner()
  const create = useCreateConversation()
  const myId = useAuthStore(s => s.userId)

  async function openDM(user: UserMini) {
    if (create.isPending) return
    try {
      const conv = await create.mutateAsync({
        type: 'DIRECT',
        targetUserId: user.id,
      })
      router.replace(`/conversations/${conv.id}`)
    } catch (e) {
      showBanner(
        isForbiddenError(e)
          ? 'Você não pode iniciar conversa com este usuário'
          : getApiError(e).message,
      )
    }
  }

  return (
    <View className="flex-1 bg-black">
      <View className="px-4 py-2.5 border-b border-zinc-900">
        <Text className="text-white font-semibold text-lg">Nova conversa</Text>
      </View>

      <PeoplePicker
        myId={myId ?? ''}
        renderItem={user => (
          <ChatPersonRow user={user} onPress={() => openDM(user)} />
        )}
        belowSearch={
          <Pressable
            onPress={() => router.push('/conversations/new-group')}
            className="flex-row items-center gap-3 px-4 py-3 border-b border-zinc-900 active:bg-zinc-900"
            accessibilityLabel="Criar novo grupo"
          >
            <View className="w-11 h-11 rounded-full bg-violet-600 items-center justify-center">
              <Ionicons name="people" size={22} color="#ffffff" />
            </View>
            <Text className="text-violet-400 font-semibold text-base">
              Novo grupo
            </Text>
          </Pressable>
        }
      />
    </View>
  )
}
