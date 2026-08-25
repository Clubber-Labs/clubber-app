import { useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { MagnifyingGlassIcon } from 'phosphor-react-native'
import { useChatUserSearch } from '../hooks/useChatUserSearch'
import { useChatSuggestions } from '../hooks/useChatSuggestions'
import type { PickablePerson } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  myId: string
  renderItem: (user: PickablePerson) => ReactElement
  // Slot entre a busca e a lista (ex: chips de selecionados, atalho "Novo grupo").
  belowSearch?: ReactNode
  // Esconde quem não passa (ex: grupo não aceita perfil privado sem follow).
  // Aplica à busca e às sugestões.
  filter?: (person: PickablePerson) => boolean
}

// Busca de pessoas com sugestões (seguindo + seguidores) enquanto não há query.
// A linha é definida pelo consumidor — DM abre direto, grupo seleciona.
export function PeoplePicker({ myId, renderItem, belowSearch, filter }: Props) {
  const { t } = useTranslation()
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
  const source = isSearching ? users : suggestions
  const listData = filter ? source.filter(filter) : source
  const loading = isSearching ? isLoading : suggestionsLoading

  return (
    <>
      <View className="px-4 py-3">
        <View className="flex-row items-center gap-2 bg-surface rounded-xl px-3">
          <MagnifyingGlassIcon size={18} color={colors.contentSubtle} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('chat.people.searchPlaceholder')}
            placeholderTextColor={colors.contentSubtle}
            autoCapitalize="none"
            textAlignVertical="center"
            className="flex-1 py-3 text-base text-content"
          />
        </View>
      </View>

      {belowSearch}

      {loading ? (
        <ActivityIndicator className="mt-6" color={colors.brandEmphasis} />
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item: PickablePerson) => item.id}
          keyboardShouldPersistTaps="handled"
          className="flex-1"
          renderItem={({ item }) => renderItem(item)}
          ListHeaderComponent={
            !isSearching && listData.length > 0 ? (
              <Text className="text-content-subtle text-xs font-semibold uppercase px-4 pt-4 pb-2">
                {t('chat.people.suggestions')}
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
              <Text className="text-content-subtle text-center mt-6">
                {t('chat.people.empty')}
              </Text>
            ) : (
              <Text className="text-content-faint text-center mt-6">
                {t('chat.people.noSuggestions')}
              </Text>
            )
          }
        />
      )}
    </>
  )
}
