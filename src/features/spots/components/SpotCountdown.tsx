import { useId, useState } from 'react'
import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { useSpotProgress } from '../hooks/useSpotProgress'
import { SPECTRUM } from '@/shared/theme'

type Props = {
  startsAt: string
  endsAt: string
}

const BAR_HEIGHT = 5
const MINUTES_IN_HOUR = 60

/**
 * Quanto da janela já correu, só pra rolê ao vivo. O espectro-assinatura
 * preenche o trilho conforme o tempo passa — é o mesmo gradiente do "agora" do
 * balão e do LivePill, na única leitura em que ele significa duração.
 */
export function SpotCountdown({ startsAt, endsAt }: Props) {
  const { t } = useTranslation()
  const { ratio, minutesLeft } = useSpotProgress(startsAt, endsAt)
  const [width, setWidth] = useState(0)
  // Id por instância: dois rolês na mesma janela disputariam a mesma entrada no
  // registro global do RNSVG se a chave viesse do horário.
  const gradientId = `spot-countdown-${useId().replace(/:/g, '')}`
  const fill = Math.max(width * ratio, 0)

  const left =
    minutesLeft >= MINUTES_IN_HOUR
      ? t('spots.feedCard.endsInHours', {
          count: Math.round(minutesLeft / MINUTES_IN_HOUR),
        })
      : t('spots.feedCard.endsInMinutes', { count: Math.max(minutesLeft, 1) })

  return (
    <View className="gap-1.5">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-[11px] tracking-[1px] text-content-muted">
          {t('spots.feedCard.rollingNow')}
        </Text>
        <Text className="text-xs font-bold text-content-secondary">{left}</Text>
      </View>
      <View
        className="overflow-hidden rounded-full bg-surface-elevated"
        style={{ height: BAR_HEIGHT }}
        onLayout={e => {
          const measured = e.nativeEvent.layout.width
          setWidth(prev => (prev === measured ? prev : measured))
        }}
      >
        {/* Fundo em SVG e não em View colorida: gradiente nativo exigiria outra
            dependência, e é o mesmo recurso do LivePill. */}
        <Svg width={fill} height={BAR_HEIGHT}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={SPECTRUM[0]} />
              <Stop offset="0.5" stopColor={SPECTRUM[1]} />
              <Stop offset="1" stopColor={SPECTRUM[2]} />
            </LinearGradient>
          </Defs>
          <Rect
            width={fill}
            height={BAR_HEIGHT}
            rx={BAR_HEIGHT / 2}
            fill={`url(#${gradientId})`}
          />
        </Svg>
      </View>
    </View>
  )
}
