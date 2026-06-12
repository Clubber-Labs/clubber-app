import { useCallback } from 'react'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { useBanner } from '@/shared/lib/banner'
import { isNotFoundError, isForbiddenError } from '@/shared/lib/apiError'
import { eventsService } from '@/features/events/services/eventsService'
import { eventKeys } from '@/features/events/hooks/cacheKeys'
import { spotsService } from '@/features/spots/services/spotsService'
import { spotKeys } from '@/features/spots/hooks/cacheKeys'
import type { Spot } from '@/features/spots/types'
import type { AppNotification, PushData } from '../schemas/notificationSchema'
import { notificationTarget } from '../lib/notificationTarget'
import type { NotificationTarget } from '../lib/notificationTarget'
import { useMarkRead } from './useMarkRead'

// Abre o destino de uma notificação: marca como lida (otimista) e navega.
// Eventos são pré-validados no backend antes da navegação — alvo removido ou
// inacessível vira banner em vez de tela de erro; o fetch ainda aquece o cache
// da tela de destino. Perfis navegam direto (a tela trata erro).
export function useOpenNotification() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const showBanner = useBanner()
  // `mutate` tem identidade estável no TanStack v5 — usar o objeto da mutation
  // re-criaria os callbacks (e re-assinaria o listener de tap) a cada transição.
  const { mutate: markRead } = useMarkRead()

  const openTarget = useCallback(
    async (target: NotificationTarget | null) => {
      if (!target) return

      switch (target.kind) {
        case 'followRequests':
          router.push('/profile/follow-requests')
          return
        case 'profile':
          router.push(`/users/${target.userId}`)
          return
        case 'event':
          try {
            await queryClient.fetchQuery({
              queryKey: eventKeys.detail(target.eventId),
              queryFn: () => eventsService.getById(target.eventId),
            })
          } catch (err) {
            if (isNotFoundError(err) || isForbiddenError(err)) {
              showBanner('Esse conteúdo não está mais disponível.')
              return
            }
            // Erro de rede etc.: navega mesmo assim — a tela tem estado de erro.
          }
          router.push(`/events/${target.eventId}`)
          return
        case 'spot':
          // 404 cobre expirado/removido, privado e bloqueio (o backend não
          // distingue de propósito) — vira banner, sem revelar mais que isso.
          try {
            await queryClient.fetchQuery({
              queryKey: spotKeys.detail(target.spotId),
              queryFn: () => spotsService.getById(target.spotId),
            })
          } catch (err) {
            if (isNotFoundError(err) || isForbiddenError(err)) {
              showBanner('Esse rolê não está mais disponível.')
              return
            }
          }
          router.push(
            target.highlightRenew
              ? `/spots/${target.spotId}?renew=1`
              : `/spots/${target.spotId}`,
          )
          return
        case 'spotChat':
          // O chat do grupo é resolvido pelo spot (conversationId). Sem ele
          // (erro de rede), cai no detalhe — que tem estado de erro próprio
          // e leva ao chat com um tap.
          try {
            const spot = await queryClient.fetchQuery<Spot>({
              queryKey: spotKeys.detail(target.spotId),
              queryFn: () => spotsService.getById(target.spotId),
            })
            router.push(`/conversations/${spot.conversationId}`)
          } catch (err) {
            if (isNotFoundError(err) || isForbiddenError(err)) {
              showBanner('Esse rolê não está mais disponível.')
              return
            }
            router.push(`/spots/${target.spotId}`)
          }
          return
      }
    },
    [queryClient, router, showBanner],
  )

  const openNotification = useCallback(
    (n: AppNotification) => {
      if (n.readAt === null) markRead(n.id)
      void openTarget(notificationTarget(n))
    },
    [markRead, openTarget],
  )

  // Tap num push do SO. Com o contrato enriquecido (notificationId/type+ids)
  // marca como lida e roteia igual à central; payload antigo cai no fallback
  // eventId → evento / actor → perfil; sem nada utilizável → central.
  const openFromPush = useCallback(
    (data: PushData) => {
      if (data.notificationId) markRead(data.notificationId)

      if (data.type) {
        const target = notificationTarget({
          type: data.type,
          actorId: data.actorId ?? data.actor?.id ?? null,
          eventId: data.eventId ?? null,
          spotId: data.spotId ?? null,
        })
        if (target) {
          void openTarget(target)
          return
        }
        router.push('/notifications')
        return
      }

      if (data.eventId) {
        void openTarget({ kind: 'event', eventId: data.eventId })
        return
      }
      if (data.actor?.id) {
        void openTarget({ kind: 'profile', userId: data.actor.id })
        return
      }
      router.push('/notifications')
    },
    [markRead, openTarget, router],
  )

  return { openNotification, openTarget, openFromPush }
}
