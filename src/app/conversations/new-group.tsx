import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useBanner } from '@/shared/lib/banner'
import { getApiError, isForbiddenError } from '@/shared/lib/apiError'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useCreateConversation } from '@/features/chat/hooks/useCreateConversation'
import { PeoplePicker } from '@/features/chat/components/PeoplePicker'
import { UserPickRow } from '@/features/chat/components/UserPickRow'
import { SelectedUserChips } from '@/features/chat/components/SelectedUserChips'
import { GroupTitleModal } from '@/features/chat/components/GroupTitleModal'
import type { UserMini } from '@/shared/types'

export default function NewGroupScreen() {
  const router = useRouter()
  const showBanner = useBanner()
  const create = useCreateConversation()
  const myId = useAuthStore(s => s.userId)

  const [selected, setSelected] = useState<UserMini[]>([])
  const [titleOpen, setTitleOpen] = useState(false)

  const selectedIds = new Set(selected.map(u => u.id))

  function toggle(user: UserMini) {
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
        <Text className="text-white font-semibold text-lg">Novo grupo</Text>
      </View>

      <PeoplePicker
        myId={myId ?? ''}
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
        <View className="px-4 pb-6 pt-2 border-t border-zinc-900">
          <Pressable
            onPress={() => setTitleOpen(true)}
            disabled={create.isPending}
            className="bg-violet-600 rounded-full py-3.5 items-center"
          >
            <Text className="text-white font-semibold text-base">
              {create.isPending
                ? 'Criando…'
                : `Criar grupo (${selected.length})`}
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
