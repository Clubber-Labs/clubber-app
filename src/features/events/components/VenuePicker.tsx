import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { VenueSearchInput } from './VenueSearchInput'
import { SelectedVenueCard } from './SelectedVenueCard'
import { AddressAutocomplete } from './AddressAutocomplete'
import { colors } from '@/shared/theme'

export type VenuePickerValue = {
  address: string
  venueName: string | null
  placeId: string | null
  latitude?: number
  longitude?: number
}

type Props = {
  value: VenuePickerValue
  onChange: (patch: Partial<VenuePickerValue>) => void
  coords: [number, number] | null
  hasError?: boolean
}

type Mode = 'search' | 'selected' | 'manual'

function initialMode(value: VenuePickerValue): Mode {
  if (value.venueName) return 'selected'
  if (value.address.trim().length > 0) return 'manual'
  return 'search'
}

export function VenuePicker({ value, onChange, coords, hasError }: Props) {
  const [mode, setMode] = useState<Mode>(() => initialMode(value))

  if (mode === 'selected' && value.venueName) {
    return (
      <SelectedVenueCard
        venueName={value.venueName}
        address={value.address}
        onClear={() => {
          onChange({ placeId: null, venueName: null })
          setMode('search')
        }}
      />
    )
  }

  if (mode === 'manual') {
    return (
      <View className="gap-2">
        <AddressAutocomplete
          value={value.address}
          onChange={address => onChange({ address })}
          onSelect={result =>
            onChange({
              address: result.placeName,
              latitude: result.latitude,
              longitude: result.longitude,
            })
          }
          hasError={hasError}
        />
        <Pressable
          onPress={() => setMode('search')}
          className="flex-row items-center gap-1.5 py-1"
        >
          <Ionicons name="search" size={15} color={colors.brandText} />
          <Text className="text-sm font-medium text-brand-text">
            Buscar estabelecimento
          </Text>
        </Pressable>
      </View>
    )
  }

  return (
    <VenueSearchInput
      coords={coords}
      hasError={hasError}
      onManual={() => {
        onChange({ placeId: null, venueName: null })
        setMode('manual')
      }}
      onSelect={(details, suggestion) => {
        onChange({
          placeId: details.placeId,
          venueName: suggestion.name,
          address: details.address ?? suggestion.address ?? suggestion.name,
          latitude: details.latitude,
          longitude: details.longitude,
        })
        setMode('selected')
      }}
    />
  )
}
