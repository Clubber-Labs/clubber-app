import { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useChatUserSearch } from '../hooks/useChatUserSearch'
import { UserPickRow } from './UserPickRow'
import type { UserMini } from '@/shared/types'

type Props = {
  visible: boolean
  existingIds: string[]
  onClose: () => void
  onAdd: (userId: string) => void
}

export function AddParticipantsModal({
  visible,
  existingIds,
  onClose,
  onAdd,
}: Props) {
  const [query, setQuery] = useState('')
  const {
    users,
    trimmed,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useChatUserSearch(query)

  const candidates = users.filter(u => !existingIds.includes(u.id))

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black pt-14">
        <View className="flex-row items-center gap-2 px-3 pb-2 border-b border-zinc-900">
          <Pressable
            onPress={onClose}
            className="w-9 h-9 items-center justify-center"
            accessibilityLabel="Fechar"
          >
            <Ionicons name="close" size={24} color="#e4e4e7" />
          </Pressable>
          <Text className="text-white font-semibold text-lg">
            Adicionar pessoas
          </Text>
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
              textAlignVertical="center"
              className="flex-1 py-3 text-base text-white"
            />
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator className="mt-6" color="#8b5cf6" />
        ) : (
          <FlatList
            data={candidates}
            keyExtractor={(item: UserMini) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <UserPickRow
                user={item}
                selected={false}
                onToggle={() => onAdd(item.id)}
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
              ) : null
            }
          />
        )}
      </View>
    </Modal>
  )
}
