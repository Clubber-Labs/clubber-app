import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { PencilSimpleIcon } from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'
import { InboxList } from '@/features/chat/components/InboxList'
import { colors } from '@/shared/theme'
import { useTabBarClearance } from '@/shared/hooks/useTabBarClearance'
import { useHeaderClearance } from '@/shared/hooks/useHeaderClearance'

export default function InboxScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const myId = useAuthStore(s => s.userId)
  const tabBarClearance = useTabBarClearance()
  const headerClearance = useHeaderClearance(0)

  if (!myId) return <View className="flex-1 bg-background" />

  const goNew = () => router.push('/conversations/new')

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: headerClearance }}
    >
      <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
        <Text className="text-content text-2xl font-bold">
          {t('tabs.messages')}
        </Text>
      </View>

      <InboxList
        myId={myId}
        onOpen={id => router.push(`/conversations/${id}`)}
        onNew={goNew}
      />

      <Pressable
        onPress={goNew}
        className="absolute right-6 w-14 h-14 rounded-full bg-content items-center justify-center"
        style={{ bottom: tabBarClearance }}
        accessibilityLabel={t('chat.inbox.newConversation')}
      >
        <PencilSimpleIcon size={24} color={colors.background} weight="fill" />
      </Pressable>
    </View>
  )
}
