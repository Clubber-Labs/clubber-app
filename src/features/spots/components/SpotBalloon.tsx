import { useId } from 'react'
import { View, Text } from 'react-native'
import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { PIN_RIM_COLOR, PIN_RIM_WIDTH } from '@/features/map/utils/markerLayout'
import { isSpotLiveNow } from '../utils/spotWindow'
import type { Spot } from '../types'
import { colors, SPECTRUM } from '@/shared/theme'

export const SPOT_BALLOON_SIZE = 48
export const SPOT_BALLOON_SIZE_SELECTED = 58

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
export const SPOT_BALLOON_TAIL_ANCHOR = {
  x: (7.5 + PAD) / CANVAS_W,
  y: (57 + PAD) / CANVAS_H,
}
// Caixa que o balão ocupa, em unidades de SPOT_BALLOON_SIZE. Quem o planta fora
// do Mapbox (sem o anchor do MarkerView) precisa dela pra pousar a ponta do
// rabinho no ponto certo.
export const SPOT_BALLOON_CANVAS = { width: CANVAS_W, height: CANVAS_H }
// Foto do criador CENTRALIZADA na caixa do balão.
const AVATAR_SIZE = 36
const AVATAR_LEFT = PAD + (BOX_W - AVATAR_SIZE) / 2
const AVATAR_TOP = PAD + (41 - AVATAR_SIZE) / 2
const BADGE_CENTER_X = PAD + BOX_W - 2
const BADGE_CENTER_Y = PAD + 2

// Balão com a foto do criador centralizada + badge de membros neutro (disco
// escuro, hairline claro) no ombro direito. Arte única do rolê no app: mapa e
// mini-mapa das telas de detalhe renderizam este mesmo componente.
export function SpotBalloon({ spot, size }: { spot: Spot; size: number }) {
  const u = size / SPOT_BALLOON_SIZE
  // Rolê dentro da janela AGORA: o rim vira o espectro-assinatura (mais
  // grosso pra leitura); fora dela, o rim escuro padrão da família.
  const live = isSpotLiveNow(spot.startsAt, spot.endsAt)
  // Id por instância, não por spot: a aba do mapa segue montada atrás da tela
  // de detalhe, então o MESMO rolê renderiza dois balões ao mesmo tempo — com
  // id derivado do spot os dois disputam a mesma entrada no registro global
  // do RNSVG.
  const rimId = `spot-rim-${useId().replace(/:/g, '')}`
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
