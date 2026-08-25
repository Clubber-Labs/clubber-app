import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { UsersIcon } from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import { useBanner } from '@/shared/lib/banner'
import { getApiError } from '@/shared/lib/apiError'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useCreateConversation } from '@/features/chat/hooks/useCreateConversation'
import { PeoplePicker } from '@/features/chat/components/PeoplePicker'
import { ChatPersonRow } from '@/features/chat/components/ChatPersonRow'
import { isReachable } from '@/features/chat/utils/reachability'
import type { UserMini } from '@/shared/types'
import { colors } from '@/shared/theme'

export default function NewConversationScreen() {
  const { t } = useTranslation()
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
      // Sem achatar o 403: PRIVATE_PROFILE e CONVERSATION_FORBIDDEN dizem
      // coisas diferentes ao usuário e as duas já têm tradução.
      showBanner(getApiError(e).message)
    }
  }

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 py-2.5 border-b border-line-subtle">
        <Text className="text-content font-semibold text-lg">
          {t('chat.people.newConversationTitle')}
        </Text>
      </View>

      <PeoplePicker
        myId={myId ?? ''}
        filter={isReachable}
        renderItem={user => (
          <ChatPersonRow user={user} onPress={() => openDM(user)} />
        )}
        belowSearch={
          <Pressable
            onPress={() => router.push('/conversations/new-group')}
            className="flex-row items-center gap-3 px-4 py-3 border-b border-line-subtle active:bg-surface"
            accessibilityLabel={t('chat.group.createNew')}
          >
            <View className="w-11 h-11 rounded-full bg-brand items-center justify-center">
              <UsersIcon size={22} color={colors.content} weight="fill" />
            </View>
            <Text className="text-brand-text font-semibold text-base">
              {t('chat.group.newGroup')}
            </Text>
          </Pressable>
        }
      />
    </View>
  )
}
