import { View, Text } from 'react-native'
import { useFonts, Sora_800ExtraBold } from '@expo-google-fonts/sora'
import { colors } from '@/shared/theme'
import { BrandSticker } from './BrandSticker'

// Wordmark "clu[b]ber" — Sora ExtraBold com o primeiro b como sticker.
// height = tamanho da fonte; o sticker escala junto (1.6x — espelhado em
// scripts/build-splash-logo.mjs, que rasteriza isto pra splash nativa).
export function BrandWordmark({
  height = 16,
  inverted = false,
}: {
  height?: number
  inverted?: boolean
}) {
  // Telas montam sob a splash antes da Sora registrar e o RN não re-mede o
  // Text quando ela chega: medição (fallback, estreita) ≠ desenho (Sora,
  // larga) e a última letra quebra pra uma 2ª linha invisível ("clu"→"cl"
  // no slide 5). Montar só com a fonte assentada iguala medida e desenho;
  // em erro de load segue com o fallback (consistente, sem clip).
  const [fontLoaded, fontError] = useFonts({ Sora_800ExtraBold })
  if (!fontLoaded && !fontError) return null

  const t = {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: height,
    lineHeight: height,
    letterSpacing: -0.052 * height,
    color: inverted ? colors.background : colors.content,
  } as const
  return (
    <View className="flex-row items-end">
      <Text style={t}>clu</Text>
      <View
        style={{ marginBottom: -height * 0.1, marginLeft: 0, marginRight: -1 }}
      >
        <BrandSticker size={height * 1.6} inverted={inverted} />
      </View>
      <Text style={t}>ber</Text>
    </View>
  )
}
