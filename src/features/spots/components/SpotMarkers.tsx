import { View, Text, Pressable } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { PIN_RIM_COLOR, PIN_RIM_WIDTH } from '@/features/map/utils/markerLayout'
import { isSpotLiveNow } from '../utils/spotWindow'
import type { Spot } from '../types'
import { colors, SPECTRUM } from '@/shared/theme'

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
// Folga do canvas: precisa caber o stroke live (centrado, metade pra fora) +
// os halos do glow do espectro.
const PAD = 10
const ART_H = 58
const CANVAS_W = BOX_W + PAD * 2
const CANVAS_H = ART_H + PAD * 2
const BUBBLE_PATH = [
  'M 14.5 0 H 33.5 Q 48 0 48 14.5 V 26.5 Q 48 41 33.5 41 H 22',
  'L 9 55.5 Q 6.2 58.2 7.6 54.6 L 12.5 41',
  'H 14.5 Q 0 41 0 26.5 V 14.5 Q 0 0 14.5 0 Z',
].join(' ')
// Ponta do rabinho (7.5, 57 na arte) — é ela que aponta o lugar do rolê.
const TAIL_TIP_ANCHOR = { x: (7.5 + PAD) / CANVAS_W, y: (57 + PAD) / CANVAS_H }
// Foto do criador CENTRALIZADA na caixa do balão.
const AVATAR_SIZE = 36
const AVATAR_LEFT = PAD + (BOX_W - AVATAR_SIZE) / 2
const AVATAR_TOP = PAD + (41 - AVATAR_SIZE) / 2
const BADGE_CENTER_X = PAD + BOX_W - 2
const BADGE_CENTER_Y = PAD + 2

// Balão com a foto do criador centralizada + badge de membros neutro (disco
// escuro, hairline claro) no ombro direito.
function SpotBalloon({ spot, size }: { spot: Spot; size: number }) {
  const u = size / BALLOON_SIZE
  // Rolê dentro da janela AGORA: o rim vira o espectro-assinatura (mais
  // grosso pra leitura); fora dela, o rim escuro padrão da família.
  const live = isSpotLiveNow(spot.startsAt, spot.endsAt)
  const rimId = `spot-rim-${spot.id}`
  return (
    <View style={{ width: CANVAS_W * u, height: CANVAS_H * u }}>
      <Svg
        width={CANVAS_W * u}
        height={CANVAS_H * u}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      >
        {live && (
          <Defs>
            <LinearGradient id={rimId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={SPECTRUM[0]} />
              <Stop offset="0.5" stopColor={SPECTRUM[1]} />
              <Stop offset="1" stopColor={SPECTRUM[2]} />
            </LinearGradient>
          </Defs>
        )}
        <G transform={`translate(${PAD}, ${PAD})`}>
          {live && (
            <>
              {/* Glow em camadas: o gradiente se espalhando com opacidade
                  decrescente atrás do contorno (sem filtro SVG). */}
              <Path
                d={BUBBLE_PATH}
                fill="none"
                stroke={`url(#${rimId})`}
                strokeWidth={PIN_RIM_WIDTH * 4 + 12}
                strokeOpacity={0.16}
                strokeLinejoin="round"
              />
              <Path
                d={BUBBLE_PATH}
                fill="none"
                stroke={`url(#${rimId})`}
                strokeWidth={PIN_RIM_WIDTH * 4 + 6}
                strokeOpacity={0.35}
                strokeLinejoin="round"
              />
            </>
          )}
          {/* Stroke centrado + fill por cima = rim só na metade externa. */}
          <Path
            d={BUBBLE_PATH}
            fill="none"
            stroke={live ? `url(#${rimId})` : PIN_RIM_COLOR}
            strokeWidth={live ? PIN_RIM_WIDTH * 4 : PIN_RIM_WIDTH * 2}
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
