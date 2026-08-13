import { View, Text, Pressable, StyleSheet } from 'react-native'
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { formatRelative } from '@/shared/utils/dateFormat'
import {
  notificationVisual,
  type NotificationTone,
} from '../utils/notificationVisual'
import type { AppNotification } from '../schemas/notificationSchema'
import { colors } from '@/shared/theme'

type Props = {
  notification: AppNotification
  onPress: (notification: AppNotification) => void
}

// Cor sólida do selo (sobre o avatar das sociais), por tom.
const BADGE_COLOR: Record<NotificationTone, string> = {
  brand: colors.brand,
  danger: colors.danger,
  success: colors.successStrong,
  warning: colors.warning,
}

// Tile de ícone das de sistema (sem actor): fundo/borda + cor do ícone por tom.
const TILE: Record<NotificationTone, { box: string; icon: string }> = {
  brand: {
    box: 'bg-brand-surface border-brand-surface-strong',
    icon: colors.brandText,
  },
  danger: { box: 'bg-danger/10 border-danger/30', icon: colors.dangerText },
  success: { box: 'bg-success/10 border-success/30', icon: colors.successText },
  warning: { box: 'bg-warning/15 border-warning/30', icon: colors.warningText },
}

export function NotificationRow({ notification, onPress }: Props) {
  const { type, title, body, createdAt, readAt, data } = notification
  const actor = data?.actor
  const unread = readAt === null
  const visual = notificationVisual(type)
  const tile = TILE[visual.tone]
  // id único por linha — evita colisão de gradiente SVG entre as linhas.
  const gradientId = `notif-gradient-${notification.id}`

  return (
    <Pressable
      onPress={() => onPress(notification)}
      className="flex-row items-start gap-3 px-4 py-3 active:bg-surface-sunken"
    >
      {/* Não-lida: fundo gradiente da marca (mesma identidade do ProfileHeader),
          mais forte à esquerda. */}
      {unread && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors.brand} stopOpacity={0.18} />
                <Stop offset="1" stopColor={colors.brand} stopOpacity={0.04} />
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
        </View>
      )}

      <View className="relative">
        {actor ? (
          <UserAvatar
            name={actor.name}
            avatarUrl={actor.avatarUrl ?? null}
            size={44}
          />
        ) : (
          <View
            className={`w-11 h-11 rounded-full border items-center justify-center ${tile.box}`}
          >
            <visual.icon size={20} color={tile.icon} weight="fill" />
          </View>
        )}
        {actor && (
          <View
            className="absolute -right-1.5 -bottom-0.5 w-5 h-5 rounded-full items-center justify-center border-2 border-background"
            style={{ backgroundColor: BADGE_COLOR[visual.tone] }}
          >
            <visual.icon size={11} color={colors.content} weight="fill" />
          </View>
        )}
      </View>

      <View className="flex-1 pt-0.5">
        <Text
          className={`text-sm ${unread ? 'text-content font-semibold' : 'text-content-tertiary'}`}
          numberOfLines={2}
        >
          {title}
        </Text>
        {body ? (
          <Text
            className="text-content-muted text-[13px] mt-0.5"
            numberOfLines={2}
          >
            {body}
          </Text>
        ) : null}
        <Text className="text-content-subtle text-xs mt-1">
          {formatRelative(createdAt)}
        </Text>
      </View>

      {unread && <View className="w-2.5 h-2.5 rounded-full bg-danger mt-1.5" />}
    </Pressable>
  )
}
