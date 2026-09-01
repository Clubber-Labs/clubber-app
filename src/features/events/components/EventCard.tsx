import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { UsersIcon, HeartIcon, ChatCircleIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { CardHighlightFrame } from '@/shared/components/CardHighlightFrame'
import {
  TicketPerforation,
  NOTCH_RADIUS,
} from '@/shared/components/TicketPerforation'
import { TicketOutline } from '@/shared/components/TicketOutline'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useToggleLike } from '../hooks/useToggleLike'
import { EventCardHero } from './EventCardHero'
import { EventCardStub } from './EventCardStub'
import { CommentPreview } from './CommentPreview'
import { CommentComposerButton } from './comments/CommentComposerButton'
import { CommentsSheet } from './comments/CommentsSheet'
import { EventAttendeesStack } from './EventAttendeesStack'
import { FeedReasonBanner } from './FeedReasonBanner'
import { featuredAttendees } from '@/shared/utils/featuredAttendees'
import type { FeedEvent } from '@/shared/types'
import { colors, METAL, SPECTRUM } from '@/shared/theme'

type Props = {
  event: FeedEvent
  onPress: () => void
  // Banner de "amigo X" só faz sentido em contexto personalizado (/feed).
  // Em listagens genéricas (sem dado de amizade), passe false.
  showReason?: boolean
  // Coords do usuário [lng, lat] pra distância na barra de local. Quem lista
  // sem proximidade resolvida omite e a distância simplesmente não aparece.
  userCoords?: [number, number] | null
}

/**
 * Card do feed no formato "pôster com canhoto destacável": a capa é o cartaz do
 * rolê (quem organiza, o que é, onde), o picote separa, e o canhoto carrega a
 * decisão (quando é, você vai?) mais o rastro social.
 *
 * A leitura desce em uma direção só — reconhecer, decidir, comentar — e por
 * isso o que era meta-row solta (categoria, relógio, prévia de comentário)
 * saiu: cada uma dessas informações já tem lugar próprio no novo desenho.
 */
export function EventCard({
  event,
  onPress,
  showReason = true,
  userCoords = null,
}: Props) {
  const { t } = useTranslation()
  const userId = useAuthStore(s => s.userId)
  const [sheetOpen, setSheetOpen] = useState(false)
  // O contorno do card é desenhado, não é `border`: ver TicketOutline.
  const [cardSize, setCardSize] = useState<{ w: number; h: number } | null>(
    null,
  )
  const [notchY, setNotchY] = useState<number | null>(null)
  const toggleLike = useToggleLike(event.id)

  const liked = event.userLiked
  const attendees = featuredAttendees(event)

  // self_created duplica o autor já exibido na assinatura da capa.
  const reason = showReason ? event.reason : null
  const showBanner = !!reason && reason.kind !== 'self_created'
  // Sem foto o banner pousa SOBRE a capa de categoria e não pinta fundo
  // próprio — dois gradientes vizinhos nunca leem como um só. Com foto ele
  // segue sendo uma faixa com o tint dele, acima da imagem.
  const hasImage = !!event.images[0]?.url
  const banner = showBanner ? (
    <FeedReasonBanner
      reason={reason}
      categories={event.categories}
      overlay={!hasImage}
    />
  ) : undefined

  // Molduras de destaque: ao vivo = gradiente do espectro; patrocinado =
  // metal (prata, par da aura dos pins). Live vence quando coincidem; fora
  // disso, borda neutra padrão.
  const live = event.status === 'ONGOING'
  const framed = live || event.isFeatured
  const frameStops = live ? SPECTRUM : METAL

  const card = (
    // Sem borda: ela e o picote disputavam a aresta. Filho de View com borda é
    // inset pela largura dela, então os furos ficavam 1px pra dentro e a linha
    // passava reta por fora, sem acompanhar o recorte — e cobrir a borda pelo
    // filho diverge entre iOS (CALayer desenha por cima) e Android (por baixo).
    // O card é um ingresso: a aresta é o corte, dada pelo contraste
    // surface/background. Os variantes com moldura já não tinham borda.
    <View
      className="overflow-hidden rounded-xl bg-surface"
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout
        setCardSize(prev =>
          prev?.w === width && prev?.h === height
            ? prev
            : { w: width, h: height },
        )
      }}
    >
      <Pressable onPress={onPress}>
        <EventCardHero
          event={event}
          userCoords={userCoords}
          onPress={onPress}
          banner={banner}
        />
      </Pressable>

      {/* O contorno precisa saber ONDE o picote caiu — depende da altura da
          capa, que varia com a foto. */}
      <TicketPerforation
        onCenterChange={center =>
          setNotchY(prev => (prev === center ? prev : center))
        }
      />
      <EventCardStub event={event} />

      <View className="flex-row items-center gap-1 border-t border-line px-2 py-1">
        <Pressable
          onPress={() => toggleLike.mutate(liked)}
          disabled={toggleLike.isPending}
          accessibilityRole="button"
          accessibilityState={{ selected: liked }}
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
          onPress={() => setSheetOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={t('events.comments.openComments')}
          className="flex-row items-center gap-1 rounded-full px-3 py-2"
        >
          <ChatCircleIcon size={18} color={colors.contentSecondary} />
          <Text className="text-sm text-content-secondary">
            {event._count.comments}
          </Text>
        </Pressable>

        {attendees.length > 0 ? (
          <View className="flex-1 pl-2">
            <EventAttendeesStack
              attendees={attendees}
              totalAttendances={event._count.attendances}
              size={22}
            />
          </View>
        ) : (
          event._count.attendances > 0 && (
            <View className="flex-1 flex-row items-center justify-end gap-1.5 pr-2">
              <UsersIcon size={14} color={colors.contentMuted} />
              <Text className="text-xs text-content-muted" numberOfLines={1}>
                {t('events.card.attendeeCount', {
                  count: event._count.attendances,
                })}
              </Text>
            </View>
          )
        )}
      </View>

      {/* Prévia sai de recentComments, que o feed já traz — a conversa inteira
          é o drawer, que só monta quando abre. */}
      <CommentPreview
        comments={event.recentComments}
        totalCount={event._count.comments}
        onExpand={() => setSheetOpen(true)}
      />

      {/* Rodapé fixo, no espírito do "Adicione um comentário..." do Instagram:
          tocar não digita aqui, abre o drawer. */}
      <CommentComposerButton onPress={() => setSheetOpen(true)} />

      {sheetOpen && (
        <CommentsSheet
          visible
          onClose={() => setSheetOpen(false)}
          target={{ kind: 'event', eventId: event.id }}
          isOrganizer={!!userId && userId === event.author.id}
        />
      )}

      {/* Última camada: a aresta é desenhada POR CIMA do conteúdo, senão os
          furos não conseguiriam perfurar a capa. */}
      {!!cardSize && notchY !== null && (
        <TicketOutline width={cardSize.w} height={cardSize.h} notchY={notchY} />
      )}
    </View>
  )

  if (!framed) return <View className="mb-10">{card}</View>

  return (
    <View className="relative mb-10">
      {card}
      {/* A moldura mergulha no mesmo picote que a aresta — sem o notch ela
          passava reta por fora dos furos. Só depois do layout: antes disso o
          centro dos furos não existe. */}
      <CardHighlightFrame
        stops={frameStops}
        notch={notchY === null ? null : { y: notchY, radius: NOTCH_RADIUS }}
      />
    </View>
  )
}
