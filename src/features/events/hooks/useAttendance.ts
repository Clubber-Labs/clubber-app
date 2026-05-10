// Padrão otimista canônico — ver CLAUDE.md → "Tratamento de erros e feedback".
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InfiniteData, QueryKey } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import { invalidateEventViews } from './cacheKeys'
import type {
  AttendanceType,
  CursorPaginatedResponse,
  EventDetail,
  FeedEvent,
} from '@/shared/types'

type FeedCache = InfiniteData<CursorPaginatedResponse<FeedEvent>>
// Feed pode ter múltiplas variações cacheadas (por filtro). Operamos em todas
// via setQueriesData/getQueriesData em vez de cache exato.
type FeedSnapshot = Array<[QueryKey, FeedCache | undefined]>
type Snapshot = {
  prevFeeds: FeedSnapshot
  prevDetail: EventDetail | undefined
}

const feedKey = ['feed'] as const

// CONFIRMED e INTERESTED contam como presença; NOT_INTERESTED não.
function countDelta(
  prev: AttendanceType | null,
  next: AttendanceType | null,
): number {
  const wasCounting = prev === 'CONFIRMED' || prev === 'INTERESTED'
  const isCounting = next === 'CONFIRMED' || next === 'INTERESTED'
  if (wasCounting && !isCounting) return -1
  if (!wasCounting && isCounting) return 1
  return 0
}

function patchEventInFeed(
  cache: FeedCache | undefined,
  eventId: string,
  patch: (event: FeedEvent) => FeedEvent,
): FeedCache | undefined {
  if (!cache) return cache
  return {
    ...cache,
    pages: cache.pages.map(page => ({
      ...page,
      data: page.data.map(event =>
        event.id === eventId ? patch(event) : event,
      ),
    })),
  }
}

function findInFeeds(
  feeds: FeedSnapshot,
  eventId: string,
): FeedEvent | undefined {
  for (const [, cache] of feeds) {
    const found = cache?.pages.flatMap(p => p.data).find(e => e.id === eventId)
    if (found) return found
  }
  return undefined
}

function applyAttendance(
  queryClient: ReturnType<typeof useQueryClient>,
  eventId: string,
  next: AttendanceType | null,
  delta: number,
) {
  queryClient.setQueriesData<FeedCache>({ queryKey: feedKey }, old =>
    patchEventInFeed(old, eventId, e => ({
      ...e,
      userAttendance: next,
      _count: { ...e._count, attendances: e._count.attendances + delta },
    })),
  )
  queryClient.setQueryData<EventDetail>(['events', eventId], old =>
    old
      ? {
          ...old,
          userAttendance: next,
          _count: {
            ...old._count,
            attendances: old._count.attendances + delta,
          },
        }
      : old,
  )
}

function restore(
  queryClient: ReturnType<typeof useQueryClient>,
  eventId: string,
  snapshot: Snapshot,
) {
  snapshot.prevFeeds.forEach(([key, data]) =>
    queryClient.setQueryData(key, data),
  )
  if (snapshot.prevDetail)
    queryClient.setQueryData(['events', eventId], snapshot.prevDetail)
}

function useAttendanceSnapshot(eventId: string) {
  const queryClient = useQueryClient()
  const detailKey = ['events', eventId]

  async function snapshot(): Promise<{
    snap: Snapshot
    current: AttendanceType | null
  }> {
    await queryClient.cancelQueries({ queryKey: feedKey })
    await queryClient.cancelQueries({ queryKey: detailKey })
    const prevFeeds: FeedSnapshot = queryClient.getQueriesData<FeedCache>({
      queryKey: feedKey,
    })
    const prevDetail = queryClient.getQueryData<EventDetail>(detailKey)
    const current =
      prevDetail?.userAttendance ??
      findInFeeds(prevFeeds, eventId)?.userAttendance ??
      null
    return { snap: { prevFeeds, prevDetail }, current }
  }

  return { snapshot, queryClient }
}

export function useSetAttendance(eventId: string) {
  const { snapshot, queryClient } = useAttendanceSnapshot(eventId)

  return useMutation({
    mutationFn: (type: AttendanceType) =>
      eventsService.setAttendance(eventId, type),
    onMutate: async type => {
      const { snap, current } = await snapshot()
      applyAttendance(queryClient, eventId, type, countDelta(current, type))
      return snap
    },
    onError: (_err, _vars, ctx) => ctx && restore(queryClient, eventId, ctx),
    onSettled: () => invalidateEventViews(queryClient, eventId),
  })
}

export function useCancelAttendance(eventId: string) {
  const { snapshot, queryClient } = useAttendanceSnapshot(eventId)

  return useMutation({
    mutationFn: () => eventsService.cancelAttendance(eventId),
    onMutate: async () => {
      const { snap, current } = await snapshot()
      applyAttendance(queryClient, eventId, null, countDelta(current, null))
      return snap
    },
    onError: (_err, _vars, ctx) => ctx && restore(queryClient, eventId, ctx),
    onSettled: () => invalidateEventViews(queryClient, eventId),
  })
}
