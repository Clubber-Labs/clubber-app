import { useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useChatUserSearch } from '../hooks/useChatUserSearch'
import { useChatSuggestions } from '../hooks/useChatSuggestions'
import type { UserMini } from '@/shared/types'

type Props = {
  myId: string
  renderItem: (user: UserMini) => ReactElement
  // Slot entre a busca e a lista (ex: chips de selecionados, atalho "Novo grupo").
  belowSearch?: ReactNode
}

// Busca de pessoas com sugestões (seguindo + seguidores) enquanto não há query.
// A linha é definida pelo consumidor — DM abre direto, grupo seleciona.
export function PeoplePicker({ myId, renderItem, belowSearch }: Props) {
  const [query, setQuery] = useState('')

  const {
    users,
    trimmed,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useChatUserSearch(query)
  const { people: suggestions, isLoading: suggestionsLoading } =
    useChatSuggestions(myId)

  const isSearching = trimmed.length >= 2
  const listData = isSearching ? users : suggestions
  const loading = isSearching ? isLoading : suggestionsLoading

  return (
    <>
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

      {belowSearch}

      {loading ? (
        <ActivityIndicator className="mt-6" color="#8b5cf6" />
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item: UserMini) => item.id}
          keyboardShouldPersistTaps="handled"
          className="flex-1"
          renderItem={({ item }) => renderItem(item)}
          ListHeaderComponent={
            !isSearching && suggestions.length > 0 ? (
              <Text className="text-zinc-500 text-xs font-semibold uppercase px-4 pt-4 pb-2">
                Sugestões
              </Text>
            ) : null
          }
          onEndReached={() => {
            if (isSearching && hasNextPage && !isFetchingNextPage)
              fetchNextPage()
          }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            isSearching ? (
              <Text className="text-zinc-500 text-center mt-6">
                Ninguém encontrado.
              </Text>
            ) : (
              <Text className="text-zinc-600 text-center mt-6">
                Siga pessoas para vê-las aqui ou busque por nome.
              </Text>
            )
          }
        />
      )}
    </>
  )
}
