import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  MagnifyingGlassIcon,
  BuildingsIcon,
  MapPinIcon,
} from 'phosphor-react-native'
import { useAddressSearch } from '../hooks/useAddressSearch'
import type { GeocodingResult } from '../services/geocodingService'
import { colors } from '@/shared/theme'

type Props = {
  value: string
  onChange: (address: string) => void
  onSelect: (result: GeocodingResult) => void
  coords: [number, number] | null
  hasError?: boolean
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  coords,
  hasError,
}: Props) {
  const { t } = useTranslation()
  const [focused, setFocused] = useState(false)
  const [justSelected, setJustSelected] = useState(false)

  const query = justSelected ? '' : value
  const { data: results, isFetching } = useAddressSearch(query, coords)

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
          className={`border ${hasError ? 'border-content' : 'border-line'} bg-surface rounded-full px-4 py-3.5 pr-10 text-base text-content`}
          placeholder={t('events.venue.addressPlaceholder')}
          placeholderTextColor={colors.contentSubtle}
          value={value}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          autoCorrect={false}
        />
        <View className="absolute right-3 top-0 bottom-0 justify-center">
          {isFetching ? (
            <ActivityIndicator size="small" color={colors.brandEmphasis} />
          ) : (
            <MagnifyingGlassIcon size={18} color={colors.contentSubtle} />
          )}
        </View>
      </View>

      {showSuggestions && (
        <View className="bg-surface border border-line rounded-xl overflow-hidden">
          {results.map((result, index) => {
            const LocationIcon = result.isPoi ? BuildingsIcon : MapPinIcon
            return (
              <Pressable
                key={result.id}
                onPress={() => handleSelect(result)}
                className={`px-4 py-3 ${index > 0 ? 'border-t border-line' : ''}`}
              >
                <View className="flex-row items-start gap-2">
                  <LocationIcon
                    size={16}
                    color={
                      result.isPoi ? colors.brandText : colors.contentMuted
                    }
                    style={{ marginTop: 2 }}
                  />
                  <View className="flex-1">
                    <Text className="text-sm text-content font-medium">
                      {result.shortName}
                    </Text>
                    <Text
                      className="text-xs text-content-muted"
                      numberOfLines={1}
                    >
                      {result.placeName}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )
          })}
        </View>
      )}
    </View>
  )
}
