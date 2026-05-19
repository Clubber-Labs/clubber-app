import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAddressSearch } from '../hooks/useAddressSearch'
import type { GeocodingResult } from '../services/geocodingService'

type Props = {
  value: string
  onChange: (address: string) => void
  onSelect: (result: GeocodingResult) => void
  hasError?: boolean
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  hasError,
}: Props) {
  const [focused, setFocused] = useState(false)
  const [justSelected, setJustSelected] = useState(false)

  const query = justSelected ? '' : value
  const { data: results, isFetching } = useAddressSearch(query)

  const showSuggestions =
    focused && !justSelected && value.trim().length >= 3 && !!results?.length

  function handleSelect(result: GeocodingResult) {
    setJustSelected(true)
    onSelect(result)
  }

  function handleChange(text: string) {
    setJustSelected(false)
    onChange(text)
  }

  return (
    <View className="gap-1">
      <View className="relative">
        <TextInput
          className={`border ${hasError ? 'border-white' : 'border-zinc-800'} bg-zinc-900 rounded-xl px-4 py-3.5 pr-10 text-base text-white`}
          placeholder="Rua, número, bairro"
          placeholderTextColor="#71717a"
          value={value}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          autoCorrect={false}
        />
        <View className="absolute right-3 top-0 bottom-0 justify-center">
          {isFetching ? (
            <ActivityIndicator size="small" color="#8b5cf6" />
          ) : (
            <Ionicons name="search" size={18} color="#71717a" />
          )}
        </View>
      </View>

      {showSuggestions && (
        <View className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {results.map((result, index) => (
            <Pressable
              key={result.id}
              onPress={() => handleSelect(result)}
              className={`px-4 py-3 ${index > 0 ? 'border-t border-zinc-800' : ''}`}
            >
              <View className="flex-row items-start gap-2">
                <Ionicons
                  name={result.isPoi ? 'business-outline' : 'location-outline'}
                  size={16}
                  color={result.isPoi ? '#a78bfa' : '#a1a1aa'}
                  style={{ marginTop: 2 }}
                />
                <View className="flex-1">
                  <Text className="text-sm text-white font-medium">
                    {result.shortName}
                  </Text>
                  <Text className="text-xs text-zinc-400" numberOfLines={1}>
                    {result.placeName}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  )
}
