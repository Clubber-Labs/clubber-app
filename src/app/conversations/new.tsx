import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useBanner } from '@/shared/lib/banner'
import { getApiError, isForbiddenError } from '@/shared/lib/apiError'
import { useChatUserSearch } from '@/features/chat/hooks/useChatUserSearch'
import { useCreateConversation } from '@/features/chat/hooks/useCreateConversation'
import { UserPickRow } from '@/features/chat/components/UserPickRow'
import { SelectedUserChips } from '@/features/chat/components/SelectedUserChips'
import { GroupTitleModal } from '@/features/chat/components/GroupTitleModal'
import type { UserMini } from '@/shared/types'

export default function NewConversationScreen() {
  const router = useRouter()
  const showBanner = useBanner()
  const create = useCreateConversation()

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<UserMini[]>([])
  const [titleOpen, setTitleOpen] = useState(false)

  const { users, trimmed, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useChatUserSearch(query)

  const selectedIds = new Set(selected.map(u => u.id))

  function toggle(user: UserMini) {
    setSelected(prev =>
      prev.some(s => s.id === user.id)
        ? prev.filter(s => s.id !== user.id)
        : [...prev, user],
    )
  }

  function handleError(e: unknown) {
    showBanner(
      isForbiddenError(e)
        ? 'Você não pode iniciar conversa com este usuário'
        : getApiError(e).message,
    )
  }

  async function startDM(user: UserMini) {
    try {
      const conv = await create.mutateAsync({
        type: 'DIRECT',
        targetUserId: user.id,
      })
      router.replace(`/conversations/${conv.id}`)
    } catch (e) {
      handleError(e)
    }
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
      handleError(e)
    }
  }

  function onConfirm() {
    if (selected.length === 1) startDM(selected[0])
    else if (selected.length >= 2) setTitleOpen(true)
  }

  return (
    <View className="flex-1 bg-black">
      <View className="flex-row items-center gap-2 px-3 py-2 border-b border-zinc-900">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={26} color="#e4e4e7" />
        </Pressable>
        <Text className="text-white font-semibold text-lg">Nova conversa</Text>
      </View>

      <View className="px-4 py-3">
        <View className="flex-row items-center gap-2 bg-zinc-900 rounded-xl px-3">
          <Ionicons name="search" size={18} color="#71717a" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar pessoas…"
            placeholderTextColor="#71717a"
            autoCapitalize="none"
            className="flex-1 py-3 text-base text-white"
          />
        </View>
      </View>

      <SelectedUserChips
        users={selected}
        onRemove={id => setSelected(prev => prev.filter(s => s.id !== id))}
      />

      {isLoading ? (
        <ActivityIndicator className="mt-6" color="#8b5cf6" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item: UserMini) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <UserPickRow
              user={item}
              selected={selectedIds.has(item.id)}
              onToggle={() => toggle(item)}
            />
          )}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage()
          }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            trimmed.length >= 2 ? (
              <Text className="text-zinc-500 text-center mt-6">
                Ninguém encontrado.
              </Text>
            ) : (
              <Text className="text-zinc-600 text-center mt-6">
                Busque por nome ou @usuário.
              </Text>
            )
          }
        />
      )}

      {selected.length > 0 && (
        <View className="px-4 pb-6 pt-2 border-t border-zinc-900">
          <Pressable
            onPress={onConfirm}
            disabled={create.isPending}
            className="bg-violet-600 rounded-full py-3.5 items-center"
          >
            <Text className="text-white font-semibold text-base">
              {create.isPending
                ? 'Abrindo…'
                : selected.length === 1
                  ? 'Conversar'
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
