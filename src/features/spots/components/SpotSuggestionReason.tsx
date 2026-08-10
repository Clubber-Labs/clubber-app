import { useId } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SparkleIcon } from 'phosphor-react-native'
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg'
import { colors } from '@/shared/theme'

type Props = {
  text: string
}

// Faixa de motivo da sugestão: a "assinatura" da IA, na mesma linguagem visual
// do FeedReasonBanner (gradiente brand-surface → transparente). Explica por que
// o rolê foi sugerido — a intenção digitada ou as preferências do usuário.
export function SpotSuggestionReason({ text }: Props) {
  // useId é estável por instância e evita colisão de id de gradiente quando há
  // mais de um banner na tela (os dois-pontos do useId não valem em url(#id)).
  const gradientId = `spot-reason-${useId().replace(/:/g, '')}`
  return (
    <View className="relative border-b border-line">
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <Stop
              offset="0"
              stopColor={colors.brandSurface}
              stopOpacity={0.7}
            />
            <Stop offset="1" stopColor={colors.brandSurface} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={`url(#${gradientId})`}
        />
      </Svg>
      <View className="flex-row items-center gap-1.5 px-4 py-2">
        <SparkleIcon size={13} color={colors.brandText} />
        <Text className="flex-1 text-xs text-content-muted" numberOfLines={1}>
          {text}
        </Text>
      </View>
    </View>
  )
}
