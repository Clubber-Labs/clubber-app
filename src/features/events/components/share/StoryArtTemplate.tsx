import { useEffect, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg'
import { BrandB, BrandStickerWordmark } from '@/shared/components/brand'
import { colors } from '@/shared/theme'
import {
  FALLBACK_ASPECT,
  STORY_CANVAS,
  STORY_HEIGHT_DP,
  STORY_WIDTH_DP,
  u,
} from '../../lib/storyCanvas'

export type StoryArtData = {
  title: string
  // Já formatados por quem monta (data no fuso do evento, autor com @).
  dateLabel: string
  authorLabel: string
  urlLabel: string
  coverUrl: string | null
  coverAspect: number
}

type Props = {
  data: StoryArtData
  // Disparado quando a arte está desenhada e pode ser capturada.
  onReady: () => void
}

// Toda medida é unidade do canvas de 1080×1920 (spec do design), convertida
// em dp pelo `u()`. O conteúdo é ancorado embaixo: a pílula da URL termina
// sempre em 1650, e o bloco de texto cresce pra cima conforme o título ocupe
// uma ou duas linhas — é isso que move o teto do texto e, com ele, o espaço
// que sobra pro flyer.
const TEXT_LEFT = 100
const TEXT_WIDTH = 880
const BOTTOM_ANCHOR = 1650
const TEXT_BLOCK_HEIGHT = { single: 308, double: 376 }

const FLYER_TOP = 300
const FLYER_MAX_WIDTH = 920
const FLYER_MAX_HEIGHT = 933
const FLYER_TEXT_GAP = 80
const FLYER_ROTATION = '2deg'

const TAPE_SIZE = { width: 280, height: 72 }

function flyerFrame(aspect: number, textTop: number) {
  const band = textTop - FLYER_TEXT_GAP - FLYER_TOP
  const maxHeight = Math.min(FLYER_MAX_HEIGHT, band)
  const height = Math.min(maxHeight, FLYER_MAX_WIDTH / aspect)
  const width = height * aspect
  return {
    width,
    height,
    left: (STORY_CANVAS.width - width) / 2,
    // Retrato preenche a caixa e encosta no topo; mais baixo que ela
    // (paisagem), centraliza na faixa entre o topo e o bloco de texto.
    top: height >= maxHeight ? FLYER_TOP : FLYER_TOP + (band - height) / 2,
  }
}

// Fitas adesivas presas aos cantos do flyer. Vivem no espaço do canvas, sem
// herdar a rotação do flyer — é o desencontro entre os dois ângulos que faz a
// colagem parecer colagem.
function tapes(frame: ReturnType<typeof flyerFrame>) {
  const right = frame.left + frame.width
  const bottom = frame.top + frame.height
  return [
    { key: 'top-left', left: frame.left - 90, top: frame.top - 38, angle: -40 },
    { key: 'top-right', left: right - 200, top: frame.top - 42, angle: 38 },
    { key: 'bottom-right', left: right - 160, top: bottom - 93, angle: -36 },
  ]
}

// Arte 1080×1920 do story. Nunca aparece na tela: é montada fora da área
// visível e vira imagem via view-shot (StoryArtCapture). Todo texto trava o
// fontScale — a escala de fonte do sistema deformaria a peça, que não é UI.
export function StoryArtTemplate({ data, onReady }: Props) {
  // O título define a altura do bloco de texto, e só o layout sabe se ele
  // coube em uma linha. Até a medida chegar, a arte é montada no caso de uma
  // linha; a captura espera as duas respostas.
  const [titleLines, setTitleLines] = useState<number | null>(null)
  const [coverLoaded, setCoverLoaded] = useState(false)
  const coverReady = !data.coverUrl || coverLoaded

  useEffect(() => {
    if (titleLines !== null && coverReady) onReady()
  }, [coverReady, onReady, titleLines])

  const textTop =
    BOTTOM_ANCHOR -
    ((titleLines ?? 1) >= 2
      ? TEXT_BLOCK_HEIGHT.double
      : TEXT_BLOCK_HEIGHT.single)
  const frame = flyerFrame(
    data.coverUrl ? data.coverAspect : FALLBACK_ASPECT,
    textTop,
  )

  return (
    <View
      style={{
        width: STORY_WIDTH_DP,
        height: STORY_HEIGHT_DP,
        backgroundColor: colors.background,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: u(620),
          top: u(-140),
          width: u(640),
          height: u(640),
          borderRadius: u(320),
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate: '-8deg' }],
        }}
      >
        <BrandB size={u(422)} color={colors.surfaceElevated} />
      </View>

      <View
        style={{
          position: 'absolute',
          left: u(frame.left),
          top: u(frame.top),
          width: u(frame.width),
          height: u(frame.height),
          transform: [{ rotate: FLYER_ROTATION }],
        }}
      >
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            borderRadius: u(24),
            overflow: 'hidden',
            backgroundColor: colors.surface,
          }}
        >
          {data.coverUrl ? (
            <Image
              source={{ uri: data.coverUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              onLoad={() => setCoverLoaded(true)}
              onError={() => setCoverLoaded(true)}
            />
          ) : (
            <>
              <Svg style={StyleSheet.absoluteFill}>
                <Defs>
                  <RadialGradient
                    id="story-poster-grad"
                    gradientUnits="userSpaceOnUse"
                    cx={u(140)}
                    cy={u(140)}
                    r={u(900)}
                  >
                    <Stop offset="0" stopColor={colors.surfaceHigh} />
                    <Stop offset="0.7" stopColor={colors.surface} />
                  </RadialGradient>
                </Defs>
                <Rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="url(#story-poster-grad)"
                />
              </Svg>
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View style={{ transform: [{ rotate: '-8deg' }] }}>
                  <BrandB size={u(380)} color={colors.surfaceHigh} />
                </View>
              </View>
            </>
          )}
        </View>
        {/* Fora do bloco que recorta, senão a pílula do sticker seria cortada
            pelo raio do flyer. */}
        <View style={{ position: 'absolute', left: u(-28), bottom: u(-36) }}>
          <BrandStickerWordmark height={u(40)} />
        </View>
      </View>

      {tapes(frame).map(tape => (
        <View
          key={tape.key}
          style={{
            position: 'absolute',
            left: u(tape.left),
            top: u(tape.top),
            width: u(TAPE_SIZE.width),
            height: u(TAPE_SIZE.height),
            backgroundColor: colors.content,
            opacity: 0.28,
            transform: [{ rotate: `${tape.angle}deg` }],
          }}
        />
      ))}

      <View
        style={{
          position: 'absolute',
          left: u(TEXT_LEFT),
          top: u(textTop),
          width: u(TEXT_WIDTH),
          alignItems: 'center',
        }}
      >
        <Text
          allowFontScaling={false}
          numberOfLines={2}
          ellipsizeMode="tail"
          onTextLayout={e => setTitleLines(e.nativeEvent.lines.length)}
          style={{
            fontFamily: 'Sora_700Bold',
            fontSize: u(60),
            lineHeight: u(68),
            letterSpacing: u(-0.6),
            color: colors.content,
            textAlign: 'center',
          }}
        >
          {data.title}
        </Text>
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          style={{
            fontSize: u(34),
            lineHeight: u(44),
            fontWeight: '500',
            marginTop: u(16),
            color: colors.contentSecondary,
          }}
        >
          {data.dateLabel}
        </Text>
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            fontSize: u(30),
            lineHeight: u(40),
            fontWeight: '500',
            marginTop: u(8),
            maxWidth: u(800),
            color: colors.contentMuted,
          }}
        >
          {data.authorLabel}
        </Text>
        <View
          style={{
            marginTop: u(44),
            paddingHorizontal: u(48),
            height: u(88),
            borderRadius: u(44),
            borderWidth: u(2),
            borderColor: colors.lineStrong,
            justifyContent: 'center',
          }}
        >
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            style={{
              fontSize: u(32),
              lineHeight: u(32),
              fontWeight: '600',
              letterSpacing: u(0.32),
              color: colors.content,
            }}
          >
            {data.urlLabel}
          </Text>
        </View>
      </View>
    </View>
  )
}
