import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Mapbox from '@rnmapbox/maps'
import type { SpotSuggestion } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  suggestions: SpotSuggestion[]
  onPress: (suggestion: SpotSuggestion) => void
}

const SIZE = 44

// Rascunhos: candidatos gerados pela IA enquanto o painel está aberto. Borda
// tracejada + ícone (sem foto — ainda não existe spot) deixam claro que é
// proposta, não spot publicado. O número liga o marcador ao card da lista
// (mesma ordem ranqueada).
export function SuggestionMarkers({ suggestions, onPress }: Props) {
  return (
    <>
      {suggestions.map((suggestion, index) => (
        <Mapbox.MarkerView
          key={suggestion.placeId}
          id={`suggestion-${suggestion.placeId}`}
          coordinate={[suggestion.longitude, suggestion.latitude]}
          anchor={{ x: 0.5, y: 0.5 }}
          allowOverlap
        >
          <Pressable
            onPress={() => onPress(suggestion)}
            accessibilityRole="button"
            accessibilityLabel={`Escolher sugestão ${suggestion.name}`}
            hitSlop={6}
            style={{
              width: SIZE,
              height: SIZE,
              borderRadius: SIZE * 0.34,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: colors.brandText,
              backgroundColor: 'rgba(10, 10, 10, 0.85)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="sparkles" size={18} color={colors.brandText} />
            <View
              style={{ position: 'absolute', top: -7, right: -7 }}
              className="bg-brand rounded-full w-5 h-5 items-center justify-center border border-background"
            >
              <Text className="text-content text-[10px] font-bold">
                {index + 1}
              </Text>
            </View>
          </Pressable>
        </Mapbox.MarkerView>
      ))}
    </>
  )
}
