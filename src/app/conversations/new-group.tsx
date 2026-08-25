import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { useBanner } from '@/shared/lib/banner'
import { getApiError } from '@/shared/lib/apiError'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useCreateConversation } from '@/features/chat/hooks/useCreateConversation'
import { PeoplePicker } from '@/features/chat/components/PeoplePicker'
import { UserPickRow } from '@/features/chat/components/UserPickRow'
import { SelectedUserChips } from '@/features/chat/components/SelectedUserChips'
import { GroupTitleModal } from '@/features/chat/components/GroupTitleModal'
import { isReachable } from '@/features/chat/utils/reachability'
import type { PickablePerson } from '@/features/chat/types'

export default function NewGroupScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const showBanner = useBanner()
  const create = useCreateConversation()
  const myId = useAuthStore(s => s.userId)

  const [selected, setSelected] = useState<PickablePerson[]>([])
  const [titleOpen, setTitleOpen] = useState(false)

  const selectedIds = new Set(selected.map(u => u.id))

  function toggle(user: PickablePerson) {
    setSelected(prev =>
      prev.some(s => s.id === user.id)
        ? prev.filter(s => s.id !== user.id)
        : [...prev, user],
    )
  }

  async function createGroup(title: string) {
    try {
      const conv = await create.mutateAsync({
        type: 'GROUP',
        title,
        participantIds: selected.map(u => u.id),
      })
      setTitleOpen(false)
      router.replace(`/conversations/${conv.id}`)
    } catch (e) {
      // Sem achatar o 403: o backend distingue PRIVATE_PROFILE de
      // CONVERSATION_FORBIDDEN e as duas já têm tradução.
      showBanner(getApiError(e).message)
    }
  }

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 py-2.5 border-b border-line-subtle">
        <Text className="text-content font-semibold text-lg">
          {t('chat.group.newGroup')}
        </Text>
      </View>

      <PeoplePicker
        myId={myId ?? ''}
        filter={isReachable}
        renderItem={user => (
          <UserPickRow
            user={user}
            selected={selectedIds.has(user.id)}
            onToggle={() => toggle(user)}
          />
        )}
        belowSearch={
          <SelectedUserChips
            users={selected}
            onRemove={id => setSelected(prev => prev.filter(s => s.id !== id))}
          />
        }
      />

      {selected.length > 0 && (
        <View className="px-4 pb-6 pt-2 border-t border-line-subtle">
          <Pressable
            onPress={() => setTitleOpen(true)}
            disabled={create.isPending}
            className="bg-brand rounded-full py-3.5 items-center"
          >
            <Text className="text-content font-semibold text-base">
              {create.isPending
                ? t('chat.group.creating')
                : t('chat.group.createWithCount', { count: selected.length })}
            </Text>
          </Pressable>
        </View>
      )}

      <GroupTitleModal
        visible={titleOpen}
        onClose={() => setTitleOpen(false)}
        submitting={create.isPending}
        onConfirm={createGroup}
      />
    </View>
  )
}
