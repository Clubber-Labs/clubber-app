import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import {
  BuildingsIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  HeartIcon,
  ChatCircleIcon,
} from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { useToggleLike } from '../hooks/useToggleLike'
import { useSetAttendance, useCancelAttendance } from '../hooks/useAttendance'
import { EventCardHero } from './EventCardHero'
import { InlineCommentsSection } from './InlineCommentsSection'
import { EventAttendeesStack } from './EventAttendeesStack'
import { FeedReasonBanner } from './FeedReasonBanner'
import { ProfileLink } from '@/features/users/components/ProfileLink'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { formatRelative, formatTime } from '@/shared/utils/dateFormat'
import { useLocale } from '@/shared/hooks/useLocale'
import { formatFullName } from '@/shared/utils/fullName'
import { featuredAttendees } from '@/shared/utils/featuredAttendees'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { useCategories } from '@/shared/hooks/useCategories'
import { eventCategoryEmoji } from '@/shared/utils/eventCategoryEmoji'
import type { FeedEvent } from '@/shared/types'
import { colors, categoryHue, METAL, SPECTRUM } from '@/shared/theme'

type Props = {
  event: FeedEvent
  onPress: () => void
  // Banner de "amigo X" só faz sentido em contexto personalizado (/feed).
  // Em listagens genéricas (sem dado de amizade), passe false.
  showReason?: boolean
}

// Chip pequeno da categoria principal — mesmo vocabulário de matiz dos chips
// do mapa (cor é informação, não marca).
function CategoryChip({ categories }: { categories: string[] }) {
  const { categories: tree } = useCategories()
  const primary = categories[0]
  const label = tree.find(entry => entry.value === primary)?.label
  if (!primary || !label) return null
  const hue = categoryHue(primary)
  return (
    <View
      className="flex-row items-center gap-1 self-start rounded-full border px-2 py-0.5"
      style={{ backgroundColor: hue.chipBg, borderColor: hue.chipBorder }}
    >
      <Text className="text-[10px]">{eventCategoryEmoji(categories)}</Text>
      <Text className="text-[10px] font-bold" style={{ color: hue.chipText }}>
        {label}
      </Text>
    </View>
  )
}

export function EventCard({ event, onPress, showReason = true }: Props) {
  const { t } = useTranslation()
  const locale = useLocale()
  const [expanded, setExpanded] = useState(false)
  // Medida real do card pro frame de destaque: Rect com "100%" não
  // re-resolve quando a altura do container muda (RNSVG/new arch) — a
  // moldura ficava cortada no meio do card.
  const [frameSize, setFrameSize] = useState<{ w: number; h: number } | null>(
    null,
  )
  const toggleLike = useToggleLike(event.id)
  const setAttendance = useSetAttendance(event.id)
  const cancelAttendance = useCancelAttendance(event.id)

  const liked = event.userLiked
  const reason = showReason ? event.reason : null
  const hasImage = !!event.images[0]?.url
  const attendees = featuredAttendees(event)
  const going = event.userAttendance === 'CONFIRMED'
  const declined = event.userAttendance === 'NOT_INTERESTED'
  const rsvpPending = setAttendance.isPending || cancelAttendance.isPending

  function handleLike() {
    toggleLike.mutate(liked)
  }

  function handleGoing() {
    if (going) cancelAttendance.mutate()
    else setAttendance.mutate('CONFIRMED')
  }

  function handleDeclined() {
    if (declined) cancelAttendance.mutate()
    else setAttendance.mutate('NOT_INTERESTED')
  }

  // Molduras de destaque: ao vivo = gradiente do espectro; patrocinado =
  // metal (prata, par da aura dos pins). Live vence quando coincidem; fora
  // disso, borda neutra padrão.
  const live = event.status === 'ONGOING'
  const framed = live || event.isFeatured
  const frameStops = live ? SPECTRUM : METAL
  const frameId = `card-frame-${event.id}`

  const card = (
    <View
      className={`overflow-hidden rounded-xl bg-surface ${framed ? '' : 'border border-line'}`}
    >
      {/* self_created duplica o autor já exibido logo abaixo */}
      {reason && reason.kind !== 'self_created' && (
        <FeedReasonBanner reason={reason} categories={event.categories} />
      )}

      <Pressable onPress={onPress}>
        <EventCardHero event={event} />

        <View className="gap-2 px-4 pt-3">
          <CategoryChip categories={event.categories} />
          {/* Com foto, a assinatura do autor já aparece sobreposta no hero;
              sem foto, o título está no hero e a assinatura vem aqui. */}
          {hasImage ? (
            <Text className="text-xl font-extrabold leading-tight text-content">
              {event.title}
            </Text>
          ) : (
            <ProfileLink
              userId={event.author.id}
              username={event.author.username}
              className="flex-row items-center gap-2 self-start py-0.5"
            >
              <UserAvatar
                name={event.author.name}
                avatarUrl={event.author.avatarUrl}
                size={24}
              />
              <Text className="text-xs text-content-muted" numberOfLines={1}>
                <Text className="font-semibold text-content-secondary">
                  {formatFullName(event.author.name, event.author.lastname)}
                </Text>
                {`  ·  ${formatRelative(event.createdAt, locale)}`}
              </Text>
            </ProfileLink>
          )}

          <View className="flex-row items-center gap-4">
            {!!(event.venueName ?? event.address) && (
              <View className="flex-1 flex-row items-center gap-1">
                {event.venueName ? (
                  <BuildingsIcon size={14} color={colors.contentMuted} />
                ) : (
                  <MapPinIcon size={14} color={colors.contentMuted} />
                )}
                <Text
                  className="flex-1 text-xs text-content-muted"
                  numberOfLines={1}
                >
                  {event.venueName ?? event.address}
                </Text>
              </View>
            )}
            <View className="flex-row items-center gap-1">
              <ClockIcon size={14} color={colors.contentMuted} />
              <Text className="text-xs text-content-muted">
                {formatTime(event.date, locale, event.timezone ?? undefined)}
              </Text>
            </View>
          </View>
        </View>

        {attendees.length > 0 ? (
          <View className="px-4 pt-3">
            <EventAttendeesStack
              attendees={attendees}
              totalAttendances={event._count.attendances}
            />
          </View>
        ) : (
          event._count.attendances > 0 && (
            <View className="flex-row items-center gap-1.5 px-4 pt-3">
              <UsersIcon size={14} color={colors.contentMuted} />
              <Text className="text-xs text-content-muted">
                {t('events.card.attendeeCount', {
                  count: event._count.attendances,
                })}
              </Text>
            </View>
          )
        )}
      </Pressable>

      {/* RSVP compacto (pills com rótulo) — estados por PESO, sem cor
          semântica: pendente = branco cheio; respondido = quieto (outline
          claro no confirmado, fantasma no não vou). "Interessado" vive só na
          tela de detalhe. */}
      <View className="flex-row items-center gap-2 px-4 pt-3">
        {going ? (
          <Pressable
            onPress={handleGoing}
            disabled={rsvpPending}
            accessibilityRole="button"
            accessibilityState={{ selected: true, busy: rsvpPending }}
            className="flex-row items-center gap-2 rounded-full border border-white/40 px-5 py-2.5"
          >
            <CheckCircleIcon size={17} color={colors.content} weight="fill" />
            <Text className="text-sm font-bold text-content">
              {t('events.rsvp.confirmed')}
            </Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={handleGoing}
              disabled={rsvpPending}
              accessibilityRole="button"
              accessibilityState={{ selected: false, busy: rsvpPending }}
              className={`flex-row items-center gap-2 rounded-full px-5 py-2.5 ${
                declined ? 'border border-line-strong' : 'bg-content'
              }`}
            >
              {!declined && (
                <CheckCircleIcon size={17} color={colors.background} />
              )}
              <Text
                className={`text-sm font-bold ${declined ? 'text-content-muted' : 'text-background'}`}
              >
                {t('events.rsvp.going')}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleDeclined}
              disabled={rsvpPending}
              accessibilityRole="button"
              accessibilityState={{ selected: declined, busy: rsvpPending }}
              className="flex-row items-center gap-2 rounded-full border border-line px-5 py-2.5"
            >
              {declined && (
                <XCircleIcon
                  size={17}
                  color={colors.contentSubtle}
                  weight="fill"
                />
              )}
              <Text
                className={`text-sm font-bold ${declined ? 'text-content-subtle' : 'text-content-muted'}`}
              >
                {t('events.rsvp.notGoing')}
              </Text>
            </Pressable>
          </>
        )}
      </View>

      {/* engajamento leve */}
      <View className="flex-row items-center gap-1 px-2 pt-1">
        <Pressable
          onPress={handleLike}
          disabled={toggleLike.isPending}
          className="flex-row items-center gap-1 rounded-full px-3 py-2"
        >
          <HeartIcon
            size={20}
            color={liked ? colors.danger : colors.contentSecondary}
            weight={liked ? 'fill' : 'regular'}
          />
          <Text
            className={`text-sm ${liked ? 'text-danger' : 'text-content-secondary'}`}
          >
            {event._count.reactions}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setExpanded(v => !v)}
          className="flex-row items-center gap-1 rounded-full px-3 py-2"
        >
          <ChatCircleIcon
            size={18}
            color={expanded ? colors.brandEmphasis : colors.contentSecondary}
            weight={expanded ? 'fill' : 'regular'}
          />
          <Text
            className={`text-sm ${expanded ? 'text-brand-text' : 'text-content-secondary'}`}
          >
            {event._count.comments}
          </Text>
        </Pressable>
      </View>

      {!expanded && (event.recentComments?.length ?? 0) > 0 && (
        <View className="gap-1 px-4 pb-3 pt-1">
          {event.recentComments.slice(0, 1).map(comment => (
            <View key={comment.id} className="flex-row">
              <ProfileLink
                userId={comment.author.id}
                username={comment.author.username}
                hitSlop={6}
              >
                <Text className="text-sm font-semibold text-content">
                  {comment.author.username}{' '}
                </Text>
              </ProfileLink>
              <Text
                className="flex-1 text-sm text-content-tertiary"
                numberOfLines={2}
              >
                {comment.content}
              </Text>
            </View>
          ))}
          {event._count.comments > 1 && (
            <Pressable onPress={() => setExpanded(true)}>
              <Text className="mt-0.5 text-xs text-content-subtle">
                {t('events.card.viewAllComments', {
                  count: event._count.comments,
                })}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {expanded && <InlineCommentsSection eventId={event.id} />}
    </View>
  )

  if (!framed) return <View className="mb-3">{card}</View>

  return (
    <View
      className="relative mb-3"
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout
        setFrameSize(prev =>
          prev?.w === width && prev?.h === height
            ? prev
            : { w: width, h: height },
        )
      }}
    >
      {card}
      {frameSize && (
        <Svg
          width={frameSize.w}
          height={frameSize.h}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Defs>
            <LinearGradient id={frameId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={frameStops[0]} />
              <Stop offset="0.5" stopColor={frameStops[1]} />
              <Stop offset="1" stopColor={frameStops[2]} />
            </LinearGradient>
          </Defs>
          {/* Mini-glow (mesma linguagem dos pins) + traço do frame. */}
          <Rect
            x={2}
            y={2}
            width={frameSize.w - 4}
            height={frameSize.h - 4}
            rx={12}
            fill="none"
            stroke={`url(#${frameId})`}
            strokeWidth={6}
            strokeOpacity={0.2}
          />
          <Rect
            x={1.25}
            y={1.25}
            width={frameSize.w - 2.5}
            height={frameSize.h - 2.5}
            rx={12.5}
            fill="none"
            stroke={`url(#${frameId})`}
            strokeWidth={2.5}
          />
        </Svg>
      )}
    </View>
  )
}
