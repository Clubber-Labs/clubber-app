import { View, Text } from 'react-native'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { EventPin, EVENT_PIN_SIZE } from '@/features/map/components/EventPin'
import {
  pinTailHeight,
  friendStackLayout,
} from '@/features/map/utils/markerLayout'
import { colors } from '@/shared/theme'

// Pin de evento SEM Mapbox, para superfícies estáticas (onboarding, empty
// states, tutoriais): a mesma arte do mapa com a pilha de amigos por cima.

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
  size = EVENT_PIN_SIZE,
  live = false,
  featured = false,
  field,
  friends = [],
  moreCount = 0,
}: Props) {
  const pin = (
    <EventPin
      size={size}
      emoji={emoji}
      field={field}
      live={live}
      featured={featured}
    />
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
