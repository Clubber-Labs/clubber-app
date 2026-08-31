import { useId } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { SPECTRUM } from '@/shared/theme'

type Props = {
  label?: string
  // Versão de tile denso (grade do perfil): mesma pílula, metade do fôlego, e
  // rótulo curto — "Rolando agora" não cabe em 175pt de largura.
  compact?: boolean
}

// Pílula do "AGORA" no espectro-assinatura — único uso de gradiente fora dos
// rims do mapa (nunca em botão/chrome). Fundo via SVG: sem dependência de
// gradiente nativo; absoluteFill dá bounds em pixel (dimensão em % não
// re-resolve na new arch quando o container ganha altura no 1º layout).
export function LivePill({ label, compact }: Props) {
  const { t } = useTranslation()
  const gradientId = `live-pill-${useId().replace(/:/g, '')}`
  return (
    <View
      className={`relative overflow-hidden self-start ${
        compact ? 'rounded-[5px]' : 'rounded-md'
      }`}
    >
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={SPECTRUM[0]} />
            <Stop offset="0.5" stopColor={SPECTRUM[1]} />
            <Stop offset="1" stopColor={SPECTRUM[2]} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
      <View
        className={`flex-row items-center ${
          compact ? 'gap-1 px-1.5 py-0.5' : 'gap-1.5 px-2.5 py-1'
        }`}
      >
        <View
          className={`rounded-full bg-content ${
            compact ? 'w-[5px] h-[5px]' : 'w-1.5 h-1.5'
          }`}
        />
        <Text
          className={`font-bold text-content ${
            compact ? 'text-[10px]' : 'text-xs'
          }`}
        >
          {label ??
            t(compact ? 'shared.livePill.nowShort' : 'shared.livePill.now')}
        </Text>
      </View>
    </View>
  )
}
