import { useId, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { CheckIcon } from 'phosphor-react-native'
import { colors, SPECTRUM } from '@/shared/theme'

type Props = {
  label: string
  active: boolean
  onPress: () => void
  // "Agora" ativo troca a pílula branca pela moldura no espectro-assinatura —
  // mesma dose de cor da LivePill, pelo mesmo motivo (o que está vivo agora).
  spectrum?: boolean
}

const CHECK_SIZE = 12
const DOT_SIZE = 5
const MARK_GAP = 5
const MARK_TIMING = { duration: 150 }
// Traço um pouco mais grosso que o anel de 1px: cobre o fio de fora e encosta
// no miolo sem deixar vão de subpixel entre os dois.
const RING_STROKE = 1.5
// Altura do chip (~30px) mais o slop chega no alvo de 44px; o lateral fica em
// metade do gap da linha, pra não roubar o toque do vizinho.
const HIT_SLOP = { top: 8, bottom: 8, left: 4, right: 4 }

// Chip do filtro de status. Não usa o Chip genérico: aqui o ativo é sólido
// branco (o filtro é o assunto da linha e precisa ganhar do card embaixo), e o
// "Agora" tem tratamento próprio.
//
// Um único box model nos três estados — a moldura de 1px é padding com fundo,
// não border: é o que deixa a marca (check ou dot) montada o tempo todo, então
// ela anima a largura ao entrar em vez de empurrar os vizinhos de uma vez.
export function StatusChip({ label, active, onPress, spectrum }: Props) {
  const gradientId = `status-chip-${useId().replace(/:/g, '')}`
  const [ring, setRing] = useState<{ w: number; h: number } | null>(null)
  const live = active && spectrum

  const markStyle = useAnimatedStyle(() => ({
    width: withTiming(active ? CHECK_SIZE : 0, MARK_TIMING),
    marginRight: withTiming(active ? MARK_GAP : 0, MARK_TIMING),
    opacity: withTiming(active ? 1 : 0, MARK_TIMING),
  }))

  return (
    <Pressable
      onPress={onPress}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className="active:opacity-70"
    >
      <View
        className={`rounded-full p-px ${
          !active ? 'bg-line-strong' : live ? '' : 'bg-content'
        }`}
      >
        <View
          className={`flex-row items-center rounded-full py-[7px] px-[13px] ${
            live ? 'bg-surface' : active ? 'bg-content' : ''
          }`}
        >
          {spectrum ? (
            // O dot entra de uma vez, sem animar a largura: o anel é um SVG
            // medido em pixel e a pílula não pode mudar de tamanho por baixo
            // dele — o traço ficaria com a medida antiga.
            <View
              className="overflow-hidden justify-center"
              style={{
                width: active ? DOT_SIZE : 0,
                marginRight: active ? MARK_GAP : 0,
              }}
            >
              <View
                className="rounded-full bg-content"
                style={{ width: DOT_SIZE, height: DOT_SIZE }}
              />
            </View>
          ) : (
            <Animated.View
              className="overflow-hidden items-start justify-center"
              style={markStyle}
            >
              <CheckIcon
                size={CHECK_SIZE}
                weight="bold"
                color={colors.background}
              />
            </Animated.View>
          )}
          <Text
            className={`text-xs ${
              live
                ? 'font-bold text-content'
                : active
                  ? 'font-bold text-background'
                  : 'font-semibold text-content-secondary'
            }`}
          >
            {label}
          </Text>
        </View>
        {/* Anel do "Agora" desenhado como traço medido em pixel, e não como
            fundo em gradiente clipado pelo raio do pai: "100%" no Rect não
            re-resolve quando o container muda de tamanho (RNSVG/new arch) e a
            ponta da pílula ficava chapada — mesma armadilha do
            CardHighlightFrame. Mede sempre, inclusive inativo, pra moldura já
            nascer no tamanho certo quando o chip acender. */}
        {spectrum && (
          <View
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
            onLayout={e => {
              const { width, height } = e.nativeEvent.layout
              setRing(prev =>
                prev?.w === width && prev?.h === height
                  ? prev
                  : { w: width, h: height },
              )
            }}
          >
            {live && !!ring && (
              <Svg width={ring.w} height={ring.h}>
                <Defs>
                  <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor={SPECTRUM[0]} />
                    <Stop offset="0.5" stopColor={SPECTRUM[1]} />
                    <Stop offset="1" stopColor={SPECTRUM[2]} />
                  </LinearGradient>
                </Defs>
                <Rect
                  x={0.5}
                  y={0.5}
                  width={ring.w - 1}
                  height={ring.h - 1}
                  rx={(ring.h - 1) / 2}
                  fill="none"
                  stroke={`url(#${gradientId})`}
                  strokeWidth={RING_STROKE}
                />
              </Svg>
            )}
          </View>
        )}
      </View>
    </Pressable>
  )
}
