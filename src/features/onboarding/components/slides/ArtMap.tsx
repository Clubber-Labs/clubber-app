import { View } from 'react-native'
import { EventPinPreview } from '../EventPinPreview'
import { Enter } from '../Enter'
import { MapBackdrop } from '../MapBackdrop'
import type { Street } from '../MapStreets'
import { FIELD_CAMP, FIELD_DRINKS, FIELD_MUSIC } from '../../constants'
import type { ArtProps } from '../../types'

// Bairro do slide 2: grade a ~-12° com jitter por rua (ângulo e espaçamento
// irregulares — quarteirões críveis, não papel quadriculado) e uma via curva
// varrendo o canto direito.
const STREETS: Street[] = [
  { axis: 'v', at: '20%', rotate: '-10deg' },
  { axis: 'v', at: '52%', rotate: '-14deg' },
  { axis: 'v', at: '72%', rotate: '-9deg' },
  { axis: 'h', at: '18%', rotate: '-11deg' },
  { axis: 'h', at: '42%', rotate: '-13deg' },
  { axis: 'h', at: '68%', rotate: '-10deg' },
]
const CURVE = (w: number, h: number) =>
  `M ${w * 0.9} ${-40} Q ${w * 0.8} ${h * 0.32} ${w * 1.24} ${h * 0.72}`

// Slide 2 — Eventos no lugar exato: o mapa É a tela, gotas na metade de cima
// caindo em sequência.
export function ArtMap({ active }: ArtProps) {
  return (
    <MapBackdrop streets={STREETS} curve={CURVE} fadeId="onb-map-fade-2">
      <View className="absolute" style={{ top: '20%', left: '10%' }}>
        <Enter active={active} variant="drop">
          <EventPinPreview emoji="🎶" field={FIELD_MUSIC} />
        </Enter>
      </View>
      <View className="absolute" style={{ top: '31%', left: '58%' }}>
        <Enter active={active} variant="drop" delay={140}>
          <EventPinPreview emoji="🍻" field={FIELD_DRINKS} />
        </Enter>
      </View>
      <View className="absolute" style={{ top: '44%', left: '19%' }}>
        <Enter active={active} variant="drop" delay={280}>
          <EventPinPreview emoji="🏕️" field={FIELD_CAMP} />
        </Enter>
      </View>
    </MapBackdrop>
  )
}
