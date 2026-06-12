import { View, Text, Pressable } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import { UserAvatar } from '@/shared/components/UserAvatar'
import type { Spot } from '../types'

type Props = {
  spots: Spot[]
  selectedId?: string
  onPress: (spot: Spot) => void
  // Semi-transparente quando a densidade (heatmap) está visível por baixo.
  dimmed?: boolean
}

const BALLOON_SIZE = 48
const BALLOON_SIZE_SELECTED = 58
const BORDER_WIDTH = 3
const DIMMED_OPACITY = 0.5
const VIOLET = '#8b5cf6'

// Proporções do balão de mensagem (estilo 💬): caixa arredondada com rabinho
// apontando pra baixo-esquerda. Derivadas do tamanho pra escalar na seleção.
const TAIL_WIDTH_RATIO = 0.28
const TAIL_HEIGHT_RATIO = 0.22
const TAIL_LEFT_RATIO = 0.16
const RADIUS_RATIO = 0.34

// Balão de mensagem com a foto de perfil do criador dentro + badge de
// membros. O formato de "speech bubble" diferencia dos pins de evento
// (círculo com borda branca e capa do banner).
function SpotBalloon({ spot, size }: { spot: Spot; size: number }) {
  const tailWidth = size * TAIL_WIDTH_RATIO
  const tailHeight = size * TAIL_HEIGHT_RATIO
  const tailLeft = size * TAIL_LEFT_RATIO

  return (
    <View style={{ width: size, height: size + tailHeight }}>
      {/* Rabinho: triângulo violeta inclinado pra esquerda, encostado por
          baixo da caixa (skewX dá o caimento do 💬). */}
      <View
        style={{
          position: 'absolute',
          left: tailLeft,
          top: size - BORDER_WIDTH,
          width: 0,
          height: 0,
          borderLeftWidth: 0,
          borderRightWidth: tailWidth,
          borderTopWidth: tailHeight,
          borderRightColor: 'transparent',
          borderTopColor: VIOLET,
          transform: [{ skewX: '-18deg' }],
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size * RADIUS_RATIO,
          borderWidth: BORDER_WIDTH,
          borderColor: VIOLET,
          backgroundColor: '#0a0a0a',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <UserAvatar
          name={`${spot.creator.name} ${spot.creator.lastname}`}
          avatarUrl={spot.creator.avatarUrl}
          size={size - BORDER_WIDTH * 2 - 4}
        />
        {spot.memberCount > 1 && (
          <View
            style={{ position: 'absolute', top: -6, right: -6 }}
            className="bg-violet-600 rounded-full min-w-[20px] h-5 px-1 items-center justify-center border border-black"
          >
            <Text className="text-white text-[10px] font-bold">
              {spot.memberCount}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

export function SpotMarkers({ spots, selectedId, onPress, dimmed }: Props) {
  return (
    <>
      {spots.map(spot => {
        const selected = selectedId === spot.id
        const size = selected ? BALLOON_SIZE_SELECTED : BALLOON_SIZE
        return (
          <Mapbox.MarkerView
            key={spot.id}
            id={`spot-${spot.id}`}
            coordinate={[spot.longitude, spot.latitude]}
            // Âncora na ponta do rabinho (esquerda-baixo) — é ela que
            // "aponta" pro lugar do rolê.
            anchor={{ x: TAIL_LEFT_RATIO, y: 1 }}
            allowOverlap
          >
            <View style={{ opacity: dimmed ? DIMMED_OPACITY : 1 }}>
              <Pressable
                onPress={() => onPress(spot)}
                accessibilityRole="button"
                accessibilityLabel={`Ver spot ${spot.title}`}
                hitSlop={6}
              >
                <SpotBalloon spot={spot} size={size} />
              </Pressable>
            </View>
          </Mapbox.MarkerView>
        )
      })}
    </>
  )
}
