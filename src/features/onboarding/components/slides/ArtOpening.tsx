import { View } from 'react-native'
import { BrandSticker } from '@/shared/components/brand'
import { EventPinPreview } from '../EventPinPreview'
import { Enter } from '../Enter'
import { ART_BOX, FIELD_CAMP, FIELD_DRINKS, FIELD_MUSIC } from '../../constants'
import type { ArtProps } from '../../types'

// Slide 1 — Abertura: marca + pins de rolês sociais. Sticker dá pop e as
// gotas caem escalonadas quando o slide entra.
export function ArtOpening({ active }: ArtProps) {
  return (
    <View className="items-center justify-center" style={ART_BOX}>
      <View className="absolute" style={{ top: 12, left: 64 }}>
        <Enter active={active} variant="drop" delay={140}>
          <EventPinPreview emoji="🎶" size={64} field={FIELD_MUSIC} />
        </Enter>
      </View>
      <View className="absolute" style={{ top: 64, right: 40 }}>
        <Enter active={active} variant="drop" delay={260}>
          <EventPinPreview emoji="🍻" size={44} field={FIELD_DRINKS} />
        </Enter>
      </View>
      <View className="absolute" style={{ top: 200, left: 52 }}>
        <Enter active={active} variant="drop" delay={380}>
          <EventPinPreview emoji="⛺" size={38} field={FIELD_CAMP} />
        </Enter>
      </View>
      <Enter active={active} variant="pop">
        <BrandSticker size={200} />
      </Enter>
    </View>
  )
}
