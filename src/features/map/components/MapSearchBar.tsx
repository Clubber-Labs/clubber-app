import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SearchInput } from '@/shared/components/SearchInput'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { useCategories } from '@/shared/hooks/useCategories'
import { useSearchEvents } from '../hooks/useSearchEvents'
import type { FeedEvent } from '@/shared/types'

type Props = {
  onSelect: (event: FeedEvent) => void
}

// Busca de eventos sobreposta no topo do mapa. Ao escolher um resultado, a tela
// voa até o evento (mesmo fora do viewport atual).
export function MapSearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const { events, trimmed, isLoading } = useSearchEvents(query)
  const { labelFor } = useCategories()
  const open = trimmed.length >= 2

  function handleSelect(event: FeedEvent) {
    Keyboard.dismiss()
    setQuery('')
    onSelect(event)
  }

  return (
    <View>
      <SearchInput
        value={query}
        onChange={setQuery}
        loading={open && isLoading}
        placeholder="Buscar eventos..."
      />

      {open && (
        <View className="mt-2 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden max-h-80">
          {isLoading ? (
            <ActivityIndicator className="py-5" color="#8b5cf6" />
          ) : events.length === 0 ? (
            <Text className="text-zinc-500 text-sm text-center py-5">
              Nenhum evento encontrado.
            </Text>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled">
              {events.map(event => (
                <Pressable
                  key={event.id}
                  onPress={() => handleSelect(event)}
                  className="flex-row items-center gap-3 px-3 py-2.5 border-b border-zinc-900 active:bg-zinc-900"
                >
                  <UserAvatar
                    name={`${event.author.name} ${event.author.lastname}`}
                    avatarUrl={event.author.avatarUrl}
                    size={36}
                  />
                  <View className="flex-1">
                    <Text
                      numberOfLines={1}
                      className="text-zinc-100 font-semibold text-sm"
                    >
                      {event.title}
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <Ionicons
                        name="location-outline"
                        size={12}
                        color="#71717a"
                      />
                      <Text
                        numberOfLines={1}
                        className="text-zinc-500 text-xs flex-1"
                      >
                        {event.address || labelFor(event.category)}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  )
}
