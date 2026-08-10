import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { MagnifyingGlassIcon } from 'phosphor-react-native'
import { VenueSearchInput } from './VenueSearchInput'
import { SelectedVenueCard } from './SelectedVenueCard'
import { AddressAutocomplete } from './AddressAutocomplete'
import { colors } from '@/shared/theme'

export type VenueSelection = {
  address: string
  venueName: string | null
  placeId: string | null
  latitude: number
  longitude: number
}

// O picker só lê address/venueName/placeId; latitude/longitude ele apenas
// escreve via onChange (o mapa é quem as consome no EventForm).
type VenueValue = Pick<VenueSelection, 'address' | 'venueName' | 'placeId'>

type Props = {
  value: VenueValue
  onChange: (patch: Partial<VenueSelection>) => void
  coords: [number, number] | null
  hasError?: boolean
}

type Mode = 'search' | 'selected' | 'manual'

function initialMode(value: VenueValue): Mode {
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
          <MagnifyingGlassIcon size={15} color={colors.brandText} />
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
