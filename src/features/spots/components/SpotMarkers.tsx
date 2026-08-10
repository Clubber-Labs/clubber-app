import { View, Text, Pressable } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import Svg, { G, Path } from 'react-native-svg'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { PIN_RIM_COLOR, PIN_RIM_WIDTH } from '@/features/map/utils/markerLayout'
import type { Spot } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  spots: Spot[]
  selectedId?: string
  onPress: (spot: Spot) => void
  // Semi-transparente quando a densidade (heatmap) está visível por baixo.
  dimmed?: boolean
}

const BALLOON_SIZE = 48
const BALLOON_SIZE_SELECTED = 58
const DIMMED_OPACITY = 0.5

// Balão de fala na família dos pins de evento: casca BRANCA sólida com o
// mesmo rim escuro das gotas (rolê ≠ evento pela silhueta, não por cor de
// marca). Caixa 48×41 com rabinho à esquerda; unidades do canvas 54×64
// (padding 3), tudo escala por size/48.
const BOX_W = 48
const PAD = 3
const CANVAS_W = 54
const CANVAS_H = 64
const BUBBLE_PATH = [
  'M 14.5 0 H 33.5 Q 48 0 48 14.5 V 26.5 Q 48 41 33.5 41 H 22',
  'L 9 55.5 Q 6.2 58.2 7.6 54.6 L 12.5 41',
  'H 14.5 Q 0 41 0 26.5 V 14.5 Q 0 0 14.5 0 Z',
].join(' ')
// Ponta do rabinho no canvas — é ela que aponta o lugar do rolê.
const TAIL_TIP_ANCHOR = { x: 10.5 / CANVAS_W, y: 60 / CANVAS_H }
// Foto do criador CENTRALIZADA na caixa do balão.
const AVATAR_SIZE = 36
const AVATAR_LEFT = PAD + (BOX_W - AVATAR_SIZE) / 2
const AVATAR_TOP = PAD + (41 - AVATAR_SIZE) / 2
const BADGE_CENTER_X = 49
const BADGE_CENTER_Y = 5

// Balão com a foto do criador centralizada + badge de membros neutro (disco
// escuro, hairline claro) no ombro direito.
function SpotBalloon({ spot, size }: { spot: Spot; size: number }) {
  const u = size / BALLOON_SIZE
  return (
    <View style={{ width: CANVAS_W * u, height: CANVAS_H * u }}>
      <Svg
        width={CANVAS_W * u}
        height={CANVAS_H * u}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      >
        <G transform={`translate(${PAD}, ${PAD})`}>
          {/* Stroke centrado + fill por cima = rim só na metade externa. */}
          <Path
            d={BUBBLE_PATH}
            fill="none"
            stroke={PIN_RIM_COLOR}
            strokeWidth={PIN_RIM_WIDTH * 2}
            strokeLinejoin="round"
          />
          <Path d={BUBBLE_PATH} fill={colors.content} />
        </G>
      </Svg>
      <View
        style={{
          position: 'absolute',
          left: AVATAR_LEFT * u,
          top: AVATAR_TOP * u,
        }}
      >
        <UserAvatar
          name={`${spot.creator.name} ${spot.creator.lastname}`}
          avatarUrl={spot.creator.avatarUrl}
          size={AVATAR_SIZE * u}
        />
      </View>
      {spot.memberCount > 1 && (
        <View
          style={{
            position: 'absolute',
            left: BADGE_CENTER_X * u - 10,
            top: BADGE_CENTER_Y * u - 10,
          }}
          className="bg-background rounded-full min-w-[20px] h-5 px-1 items-center justify-center border border-white/50"
        >
          <Text className="text-content text-[10px] font-bold">
            {spot.memberCount}
          </Text>
        </View>
      )}
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
            anchor={TAIL_TIP_ANCHOR}
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
