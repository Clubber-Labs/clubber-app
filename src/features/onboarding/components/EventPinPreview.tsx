import { View, Text } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { EmojiPinFace } from '@/shared/components/EmojiPinFace'
import {
  pinTailHeight,
  pinTailPath,
  friendStackLayout,
  PIN_RIM_COLOR,
  PIN_RIM_COLOR_ON_DARK,
  PIN_RIM_WIDTH,
} from '@/features/map/utils/markerLayout'
import { colors, SPECTRUM } from '@/shared/theme'

// Pin de evento SEM Mapbox — mesma arte do EventPin de EventMarkers.tsx
// (mesmos utils de geometria, rim, espectro e pilha de amigos), para uso em
// superfícies estáticas: onboarding, empty states, tutoriais.
// Se EventPin mudar lá, espelhar aqui (ou extrair a arte pra shared/).

type PreviewFriend = { name: string; avatarUrl?: string | null }

type Props = {
  emoji: string
  size?: number
  live?: boolean
  // Patrocinado: casca escura invertida + selo ★ (mesma regra do EventPin).
  featured?: boolean
  field?: string
  friends?: PreviewFriend[]
  moreCount?: number
}

export function EventPinPreview({
  emoji,
  size = 54,
  live = false,
  featured = false,
  field,
  friends = [],
  moreCount = 0,
}: Props) {
  const inner = size - 6
  const height = size + pinTailHeight(size)
  const shell = featured ? colors.background : colors.content
  const rimWidth = live ? PIN_RIM_WIDTH * 2 : PIN_RIM_WIDTH
  const glow = live || featured ? 6 : 0
  const pad = rimWidth + glow + 2
  const rim = live
    ? 'url(#pin-preview-rim)'
    : featured
      ? PIN_RIM_COLOR_ON_DARK
      : PIN_RIM_COLOR
  const haloFill = live ? rim : colors.content
  const haloStrong = live ? 0.35 : 0.32
  const haloSoft = live ? 0.16 : 0.14
  const sealSize = Math.round(size * 0.34)

  const pin = (
    <View style={{ width: size, height }}>
      <Svg
        width={size + pad * 2}
        height={height + pad * 2}
        viewBox={`${-pad} ${-pad} ${size + pad * 2} ${height + pad * 2}`}
        style={{ position: 'absolute', left: -pad, top: -pad }}
      >
        {live && (
          <Defs>
            <LinearGradient id="pin-preview-rim" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={SPECTRUM[0]} />
              <Stop offset="0.5" stopColor={SPECTRUM[1]} />
              <Stop offset="1" stopColor={SPECTRUM[2]} />
            </LinearGradient>
          </Defs>
        )}
        {glow > 0 && (
          <>
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
            alignItems: 'center',
            justifyContent: 'center',
          }}
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

  const count = friends.length + (moreCount > 0 ? 1 : 0)
  if (count === 0) return pin

  const layout = friendStackLayout(size, pinTailHeight(size), count)
  const f = layout.avatarSize

  return (
    <View style={{ width: layout.frameWidth, height: layout.frameHeight }}>
      <View style={{ position: 'absolute', left: 0, top: 0 }}>{pin}</View>
      {moreCount > 0 && (
        <View
          style={{
            position: 'absolute',
            left: layout.firstAvatarX + friends.length * layout.step - f / 2,
            top: layout.friendTop,
            width: f,
            height: f,
            borderRadius: f / 2,
            borderWidth: 2,
            borderColor: colors.surfaceSunken,
            backgroundColor: colors.line,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{ color: colors.content, fontSize: 11, fontWeight: '700' }}
          >
            +{moreCount}
          </Text>
        </View>
      )}
      {[...friends].reverse().map((friend, i) => {
        const index = friends.length - 1 - i
        return (
          <View
            key={friend.name + index}
            style={{
              position: 'absolute',
              left: layout.firstAvatarX + index * layout.step - f / 2,
              top: layout.friendTop,
              width: f,
              height: f,
              borderRadius: f / 2,
              borderWidth: 2,
              borderColor: colors.surfaceSunken,
              overflow: 'hidden',
            }}
          >
            <UserAvatar
              name={friend.name}
              avatarUrl={friend.avatarUrl}
              size={f - 4}
            />
          </View>
        )
      })}
    </View>
  )
}
