import type { ComponentProps, ReactNode } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Rect,
} from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { formatEventDate } from '@/shared/utils/dateFormat'
import { formatFullName } from '@/shared/utils/fullName'
import { CategoryBadge } from '@/shared/components/CategoryBadge'
import { AddressLink } from '@/shared/components/AddressLink'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { EventStatusBadge } from './EventStatusBadge'
import { EventDateChip } from './EventDateChip'
import { EventImagesCarousel } from './EventImagesCarousel'
import { EventAttendeesStack } from './EventAttendeesStack'
import type { EventDetail } from '@/shared/types'
import { colors } from '@/shared/theme'

type IconName = ComponentProps<typeof Ionicons>['name']

type Props = {
  event: EventDetail
  onAuthorPress?: () => void
  // Voltar — vira botão flutuante no topo-esquerdo (hero imersivo sem header).
  onBack?: () => void
  // Menu do autor (editar/excluir) ou botão de denúncia — definido pela tela,
  // sobreposto no topo-direito do hero.
  actions?: ReactNode
}

// Linha de meta: ícone destacado num quadrado + título forte + subtítulo.
function MetaRow({
  icon,
  title,
  subtitle,
  chevron,
}: {
  icon: IconName
  title: string
  subtitle?: string
  chevron?: boolean
}) {
  return (
    <View className="flex-row items-center gap-3 border-b border-line py-3">
      <View className="h-9 w-9 items-center justify-center rounded-lg bg-surface">
        <Ionicons name={icon} size={18} color={colors.brandText} />
      </View>
      <View className="flex-1">
        <Text className="text-content text-sm font-bold">{title}</Text>
        {!!subtitle && (
          <Text className="text-content-muted text-xs" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {chevron && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.contentSubtle}
        />
      )}
    </View>
  )
}

export function EventHeader({ event, onAuthorPress, onBack, actions }: Props) {
  const insets = useSafeAreaInsets()
  const hasImages = event.images.length > 0
  const isPast = event.status === 'PAST' || event.status === 'CANCELED'
  const gradId = `event-hero-grad-${event.id}`
  const scrimId = `event-hero-scrim-${event.id}`
  const attendees = event.topAttendances ?? []

  const heroOverlays: ReactNode = (
    <>
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id={scrimId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0.45" stopColor={colors.background} stopOpacity={0} />
            <Stop offset="1" stopColor={colors.background} stopOpacity={0.82} />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={`url(#${scrimId})`}
        />
      </Svg>
      <View
        className="absolute inset-x-4 flex-row items-center justify-between"
        style={{ top: insets.top + 8 }}
      >
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityLabel="Voltar"
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full bg-background/50"
          >
            <Ionicons name="chevron-back" size={24} color={colors.content} />
          </Pressable>
        ) : (
          <View className="h-10 w-10" />
        )}
        {actions ?? <View className="h-10 w-10" />}
      </View>
      <View className="absolute inset-x-4 bottom-4 flex-row items-end justify-between gap-3">
        <View className="flex-1 gap-2.5">
          <View className="flex-row">
            <EventStatusBadge status={event.status} date={event.date} />
          </View>
          <Pressable
            onPress={onAuthorPress}
            accessibilityLabel={`Ver perfil de ${event.author.username}`}
            className="flex-row items-center gap-2.5"
          >
            <View className="rounded-full border-2 border-white/70">
              <UserAvatar
                name={formatFullName(event.author.name, event.author.lastname)}
                avatarUrl={event.author.avatarUrl}
                size={34}
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-content text-sm font-bold"
                numberOfLines={1}
              >
                {formatFullName(event.author.name, event.author.lastname)}
              </Text>
              <Text className="text-content-tertiary text-xs">Organizador</Text>
            </View>
          </Pressable>
        </View>
        <EventDateChip date={event.date} muted={isPast} />
      </View>
    </>
  )

  return (
    <View>
      {/* HERO full-bleed: -mx-4 cancela o padding (16px) do container pai. */}
      <View className="relative -mx-4">
        {hasImages ? (
          <EventImagesCarousel images={event.images} height={300} />
        ) : (
          <View style={{ height: 240 }} className="overflow-hidden bg-surface">
            <Svg style={StyleSheet.absoluteFill}>
              <Defs>
                <RadialGradient id={gradId} cx="0" cy="0" r="1">
                  <Stop offset="0" stopColor={colors.brandSurfaceStrong} />
                  <Stop offset="0.62" stopColor={colors.surface} />
                </RadialGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill={`url(#${gradId})`}
              />
            </Svg>
          </View>
        )}
        {heroOverlays}
      </View>

      {/* META */}
      <View className="gap-4 pt-4">
        {(event.categories.length > 0 || !event.isPublic) && (
          <View className="flex-row flex-wrap items-center gap-2">
            {event.categories.map(category => (
              <CategoryBadge key={category} value={category} />
            ))}
            {!event.isPublic && (
              <View className="flex-row items-center gap-1 rounded-md bg-surface-elevated px-2.5 py-1">
                <Ionicons
                  name="lock-closed"
                  size={11}
                  color={colors.contentTertiary}
                />
                <Text className="text-content-tertiary text-xs font-semibold">
                  Privado
                </Text>
              </View>
            )}
          </View>
        )}

        <Text className="text-content text-2xl font-extrabold leading-tight">
          {event.title}
        </Text>

        <View>
          <AddressLink
            address={event.address}
            latitude={event.latitude}
            longitude={event.longitude}
          >
            <MetaRow
              icon="location-outline"
              title={event.address ?? 'Ver localização no mapa'}
              subtitle={event.address ? 'Abrir no mapa' : undefined}
              chevron
            />
          </AddressLink>
          <MetaRow icon="time-outline" title={formatEventDate(event.date)} />
        </View>

        {!!event.description && (
          <Text className="text-content-secondary text-[15px] leading-6">
            {event.description}
          </Text>
        )}

        {(attendees.length > 0 || event._count.attendances > 0) && (
          <View className="gap-3 border-t border-line pt-4">
            <Text className="text-content text-base font-extrabold">
              Quem vai
            </Text>
            {attendees.length > 0 ? (
              <EventAttendeesStack
                attendees={attendees}
                totalAttendances={event._count.attendances}
              />
            ) : (
              <Text className="text-content-muted text-sm">
                {event._count.attendances}{' '}
                {event._count.attendances === 1 ? 'confirmado' : 'confirmados'}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  )
}
