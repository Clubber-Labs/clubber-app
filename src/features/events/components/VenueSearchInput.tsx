import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useVenueSearch } from '../hooks/useVenueSearch'
import { VenueSuggestionItem } from './VenueSuggestionItem'
import type { PlaceDetails, VenueSuggestion } from '../services/placesService'
import { colors } from '@/shared/theme'

type Props = {
  coords: [number, number] | null
  onSelect: (details: PlaceDetails, suggestion: VenueSuggestion) => void
  onManual: () => void
  hasError?: boolean
}

export function VenueSearchInput({
  coords,
  onSelect,
  onManual,
  hasError,
}: Props) {
  const { query, setQuery, suggestions, status, selectPlace } =
    useVenueSearch(coords)
  const [selecting, setSelecting] = useState(false)
  const [detailsError, setDetailsError] = useState(false)

  const showSuggestions = query.trim().length >= 3 && suggestions.length > 0
  const busy = status === 'searching' || selecting

  async function handleSelect(suggestion: VenueSuggestion) {
    setSelecting(true)
    setDetailsError(false)
    try {
      const details = await selectPlace(suggestion.placeId)
      onSelect(details, suggestion)
    } catch {
      // 404 (placeId sumiu do Google) ou falha de rede: não trava o fluxo,
      // o usuário escolhe outro local ou cai no endereço manual.
      setDetailsError(true)
    } finally {
      setSelecting(false)
    }
  }

  return (
    <View className="gap-2">
      <View className="relative">
        <TextInput
          className={`border ${hasError ? 'border-content' : 'border-line'} bg-surface rounded-xl px-4 py-3.5 pr-10 text-base text-content`}
          placeholder="Buscar estabelecimento"
          placeholderTextColor={colors.contentSubtle}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
        <View className="absolute right-3 top-0 bottom-0 justify-center">
          {busy ? (
            <ActivityIndicator size="small" color={colors.brandEmphasis} />
          ) : (
            <Ionicons name="search" size={18} color={colors.contentSubtle} />
          )}
        </View>
      </View>

      {showSuggestions && (
        <View className="bg-surface border border-line rounded-xl overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <VenueSuggestionItem
              key={suggestion.placeId}
              suggestion={suggestion}
              onPress={() => handleSelect(suggestion)}
              divider={index > 0}
            />
          ))}
        </View>
      )}

      {status === 'unavailable' && (
        <Text className="text-xs text-content-muted">
          Busca de locais indisponível. Você pode inserir o endereço
          manualmente.
        </Text>
      )}

      {detailsError && (
        <Text className="text-xs text-content-muted">
          Não foi possível carregar este local. Escolha outro ou insira o
          endereço manualmente.
        </Text>
      )}

      <Pressable
        onPress={onManual}
        className="flex-row items-center gap-1.5 py-1"
      >
        <Ionicons name="create-outline" size={15} color={colors.brandText} />
        <Text className="text-sm font-medium text-brand-text">
          Inserir endereço manualmente
        </Text>
      </Pressable>
    </View>
  )
}
