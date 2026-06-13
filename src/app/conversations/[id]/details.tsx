import { View, ScrollView, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useConversation } from '@/features/chat/hooks/useConversation'
import { DMDetails } from '@/features/chat/components/DMDetails'
import { GroupDetails } from '@/features/chat/components/GroupDetails'
import { colors } from '@/shared/theme'

export default function ConversationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const myId = useAuthStore(s => s.userId) ?? ''
  const { data: conversation, isLoading } = useConversation(id)

  if (isLoading || !conversation) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={colors.brandEmphasis} />
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {conversation.type === 'DIRECT' ? (
        <DMDetails
          conversation={conversation}
          myId={myId}
          onViewProfile={uid => router.push(`/users/${uid}`)}
        />
      ) : (
        <GroupDetails
          conversation={conversation}
          myId={myId}
          onLeft={() => router.replace('/messages')}
        />
      )}
    </ScrollView>
  )
}
