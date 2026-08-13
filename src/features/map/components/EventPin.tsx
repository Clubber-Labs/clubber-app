import { useId } from 'react'
import { View, Text } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg'
import { EmojiPinFace } from '@/shared/components/EmojiPinFace'
import { colors, SPECTRUM } from '@/shared/theme'
import {
  pinTailHeight,
  pinTailPath,
  PIN_RIM_COLOR,
  PIN_RIM_COLOR_ON_DARK,
  PIN_RIM_WIDTH,
} from '../utils/markerLayout'

export const EVENT_PIN_SIZE = 54
export const EVENT_PIN_SIZE_SELECTED = 66
// A ponta da gota fica na base do quadro — é ela que aponta a coordenada.
export const EVENT_PIN_TIP_ANCHOR = { x: 0.5, y: 1 }

type Props = {
  size: number
  emoji: string
  field?: string
  // Espectro do "agora": evento acontecendo troca o rim pelo gradiente-
  // assinatura (mais grosso) e ganha glow.
  live?: boolean
  // Patrocinado destaca por INVERSÃO (única casca escura do mapa + selo ★),
  // não por cor de marca.
  featured?: boolean
  // Selecionado no mapa: casca mais clara.
  selected?: boolean
  // Encerrado.
  faded?: boolean
}

// Pin do evento em gota invertida: a cabeça mostra SEMPRE o emoji da
// categoria sobre campo grafite — a capa do banner fica pro card de preview
// e pro avatar do organizador pendurado (socialItems), nunca na cabeça.
// Arte única do evento no app: mapa, mini-mapa das telas de detalhe/formulário
// e superfícies estáticas (onboarding) renderizam este mesmo componente.
export function EventPin({
  size,
  emoji,
  field,
  live,
  featured,
  selected,
  faded,
}: Props) {
  // Id único por instância: com vários pins o id fixo colidia no registro
  // global do RNSVG e o último gradiente vencia.
  const rimId = `pin-rim-${useId().replace(/:/g, '')}`
  const inner = size - 6
  const height = size + pinTailHeight(size)
  const shell = featured
    ? colors.background
    : selected
      ? colors.contentBright
      : colors.content
  const rim = live
    ? `url(#${rimId})`
    : featured
      ? PIN_RIM_COLOR_ON_DARK
      : PIN_RIM_COLOR
  const rimWidth = live ? PIN_RIM_WIDTH * 2 : PIN_RIM_WIDTH
  // Espalhamento do glow: live = halos do espectro; patrocinado = aura
  // branca-prata saindo do rim claro (destaque no estilo da inversão, sem
  // cor). Branco é perceptualmente mais claro → opacidades menores.
  const glow = live || featured ? 6 : 0
  const haloFill = live ? rim : colors.content
  const haloStrong = live ? 0.35 : 0.32
  const haloSoft = live ? 0.16 : 0.14
  // Margem do canvas acompanha rim + glow: o gradiente do "agora" é mais
  // grosso e estourava a folga fixa de 2, cortando nas laterais e no topo.
  const pad = rimWidth + glow + 2
  const sealSize = Math.round(size * 0.34)
  return (
    <View style={{ width: size, height, opacity: faded ? 0.55 : 1 }}>
      <Svg
        width={size + pad * 2}
        height={height + pad * 2}
        viewBox={`${-pad} ${-pad} ${size + pad * 2} ${height + pad * 2}`}
        style={{ position: 'absolute', left: -pad, top: -pad }}
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
        {glow > 0 && (
          <>
            {/* Glow em camadas (sem filtro SVG — instável no RN): a cor do
                halo se espalhando com opacidade decrescente. */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 + rimWidth + glow}
              fill={haloFill}
              fillOpacity={haloSoft}
            />
            <Path
              d={pinTailPath(size, rimWidth + glow)}
              fill={haloFill}
              fillOpacity={haloSoft}
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 + rimWidth + glow / 2}
              fill={haloFill}
              fillOpacity={haloStrong}
            />
            <Path
              d={pinTailPath(size, rimWidth + glow / 2)}
              fill={haloFill}
              fillOpacity={haloStrong}
            />
          </>
        )}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 + rimWidth}
          fill={rim}
        />
        <Path d={pinTailPath(size, rimWidth)} fill={rim} />
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={shell} />
        <Path d={pinTailPath(size)} fill={shell} />
      </Svg>
      <View
        style={{
          position: 'absolute',
          left: 3,
          top: 3,
          width: inner,
          height: inner,
          borderRadius: inner / 2,
          overflow: 'hidden',
        }}
      >
        <EmojiPinFace size={inner} emoji={emoji} field={field} />
      </View>
      {featured && (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: sealSize,
            height: sealSize,
            borderRadius: sealSize / 2,
            backgroundColor: colors.content,
            borderWidth: 1,
            borderColor: PIN_RIM_COLOR,
          }}
          className="items-center justify-center"
        >
          <Text
            style={{
              color: colors.background,
              fontSize: Math.round(sealSize * 0.62),
              fontWeight: '700',
              includeFontPadding: false,
            }}
          >
            ★
          </Text>
        </View>
      )}
    </View>
  )
}
