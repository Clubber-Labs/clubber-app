import { View, Text } from 'react-native'
import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { PIN_RIM_COLOR, PIN_RIM_WIDTH } from '@/features/map/utils/markerLayout'
import { colors, SPECTRUM } from '@/shared/theme'

// Balão de rolê SEM Mapbox — mesma arte do SpotBalloon de SpotMarkers.tsx
// (mesmo path, rim, glow do espectro e badge de membros), para onboarding,
// empty states e tutoriais. Se SpotBalloon mudar lá, espelhar aqui.

const BALLOON_SIZE = 48
const BOX_W = 48
const PAD = 10
const ART_H = 58
const CANVAS_W = BOX_W + PAD * 2
const CANVAS_H = ART_H + PAD * 2
const BUBBLE_PATH = [
  'M 14.5 0 H 33.5 Q 48 0 48 14.5 V 26.5 Q 48 41 33.5 41 H 22',
  'L 9 55.5 Q 6.2 58.2 7.6 54.6 L 12.5 41',
  'H 14.5 Q 0 41 0 26.5 V 14.5 Q 0 0 14.5 0 Z',
].join(' ')
const AVATAR_SIZE = 36
const AVATAR_LEFT = PAD + (BOX_W - AVATAR_SIZE) / 2
const AVATAR_TOP = PAD + (41 - AVATAR_SIZE) / 2
const BADGE_CENTER_X = PAD + BOX_W - 2
const BADGE_CENTER_Y = PAD + 2

type Props = {
  creatorName: string
  creatorAvatarUrl?: string | null
  memberCount?: number
  live?: boolean
  size?: number
}

export function SpotBalloonPreview({
  creatorName,
  creatorAvatarUrl,
  memberCount = 0,
  live = false,
  size = BALLOON_SIZE,
}: Props) {
  const u = size / BALLOON_SIZE
  return (
    <View style={{ width: CANVAS_W * u, height: CANVAS_H * u }}>
      <Svg
        width={CANVAS_W * u}
        height={CANVAS_H * u}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      >
        {live && (
          <Defs>
            <LinearGradient id="spot-preview-rim" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={SPECTRUM[0]} />
              <Stop offset="0.5" stopColor={SPECTRUM[1]} />
              <Stop offset="1" stopColor={SPECTRUM[2]} />
            </LinearGradient>
          </Defs>
        )}
        <G transform={`translate(${PAD}, ${PAD})`}>
          {live && (
            <>
              <Path
                d={BUBBLE_PATH}
                fill="none"
                stroke="url(#spot-preview-rim)"
                strokeWidth={PIN_RIM_WIDTH * 4 + 12}
                strokeOpacity={0.16}
                strokeLinejoin="round"
              />
              <Path
                d={BUBBLE_PATH}
                fill="none"
                stroke="url(#spot-preview-rim)"
                strokeWidth={PIN_RIM_WIDTH * 4 + 6}
                strokeOpacity={0.35}
                strokeLinejoin="round"
              />
            </>
          )}
          <Path
            d={BUBBLE_PATH}
            fill="none"
            stroke={live ? 'url(#spot-preview-rim)' : PIN_RIM_COLOR}
            strokeWidth={live ? PIN_RIM_WIDTH * 4 : PIN_RIM_WIDTH * 2}
            strokeLinejoin="round"
          />
          <Path d={BUBBLE_PATH} fill={colors.content} />
        </G>
      </Svg>
      <View
        style={{
          position: 'absolute',
          left: AVATAR_LEFT * u,
          top: AVATAR_TOP * u,
        }}
      >
        <UserAvatar
          name={creatorName}
          avatarUrl={creatorAvatarUrl}
          size={AVATAR_SIZE * u}
        />
      </View>
      {memberCount > 1 && (
        <View
          style={{
            position: 'absolute',
            left: BADGE_CENTER_X * u - 10,
            top: BADGE_CENTER_Y * u - 10,
          }}
          className="bg-background rounded-full min-w-[20px] h-5 px-1 items-center justify-center border border-white/50"
        >
          <Text className="text-content text-[10px] font-bold">
            {memberCount}
          </Text>
        </View>
      )}
    </View>
  )
}
