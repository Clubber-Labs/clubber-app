import { View, Text } from 'react-native'
import { SpotBalloonPreview } from '../SpotBalloonPreview'
import { Enter } from '../Enter'
import { MapBackdrop } from '../MapBackdrop'
import type { Street } from '../MapStreets'
import type { ArtProps } from '../../types'

// Bairro do slide 3: grade a ~+9° com jitter e via curva no canto esquerdo.
const STREETS: Street[] = [
  { axis: 'v', at: '28%', rotate: '8deg' },
  { axis: 'v', at: '66%', rotate: '11deg' },
  { axis: 'h', at: '22%', rotate: '9deg' },
  { axis: 'h', at: '48%', rotate: '7deg' },
  { axis: 'h', at: '76%', rotate: '10deg' },
]
const CURVE = (w: number, h: number) =>
  `M ${-10} ${h * 0.0} Q ${w * 0.2} ${h * 0.12} ${-40} ${h * 0.6}`

// Slide 3 — Rolê é o que você inventar: balão da criadora dá pop sobre o
// mapa; a legenda sobe logo depois.
export function ArtSpot({ active }: ArtProps) {
  return (
    <MapBackdrop streets={STREETS} curve={CURVE} fadeId="onb-map-fade-3">
      <View
        className="absolute items-center"
        style={{ top: '36%', left: 0, right: 0 }}
      >
        <Enter active={active} variant="pop">
          <SpotBalloonPreview
            creatorName="Luiza"
            memberCount={5}
            live
            size={64}
          />
        </Enter>
      </View>
      <View
        className="absolute items-center"
        style={{ top: '28%', left: 0, right: 0 }}
      >
        <Enter active={active} variant="rise" delay={240}>
          <View className="rounded-lg bg-background/70 px-2.5 py-1">
            <Text className="text-[18px] text-content-muted">
              @luiza_santos sugeriu um rolê
            </Text>
          </View>
        </Enter>
      </View>
    </MapBackdrop>
  )
}
