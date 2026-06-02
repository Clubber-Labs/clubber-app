// Padrão otimista canônico — ver CLAUDE.md → "Tratamento de erros e feedback".
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InfiniteData, QueryKey } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import { invalidateEventViews } from './cacheKeys'
import type {
  AttendanceType,
  CursorPaginatedResponse,
  EventDetail,
  FeedAuthor,
  FeedEvent,
} from '@/shared/types'

type FeedCache = InfiniteData<CursorPaginatedResponse<FeedEvent>>
// Eventos do mapa por viewport (ver useViewportEvents) — pra o pin refletir
// presença na hora, sem esperar o refetch.
type MapEventsCache = { data: FeedEvent[]; truncated: boolean }
// Feed/mapa podem ter múltiplas variações cacheadas (por filtro/bbox). Operamos
// em todas via setQueriesData/getQueriesData em vez de cache exato.
type FeedSnapshot = Array<[QueryKey, FeedCache | undefined]>
type MapSnapshot = Array<[QueryKey, MapEventsCache | undefined]>
type Snapshot = {
  prevFeeds: FeedSnapshot
  prevMap: MapSnapshot
  prevDetail: EventDetail | undefined
}

type MeMini = {
  id: string
  name: string
  lastname: string
  username: string
  avatarUrl?: string | null
}

const feedKey = ['feed'] as const
const mapKey = ['map-events'] as const

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

// Usuário logado a partir do cache (pra colocar meu avatar no pin na hora).
function currentUser(
  queryClient: ReturnType<typeof useQueryClient>,
): FeedAuthor | null {
  const me = queryClient.getQueryData<MeMini>(['users', 'me'])
  if (!me) return null
  return {
    id: me.id,
    name: me.name,
    lastname: me.lastname,
    username: me.username,
    avatarUrl: me.avatarUrl ?? null,
  }
}

// Adiciona/remove o usuário logado no topAttendances do evento no cache do mapa.
// Append (cap 5) espelha o backend (eu, não-amigo, fico depois dos amigos): em
// evento pequeno apareço; em evento cheio fico no "+N" — sem flicker no refetch.
function patchEventInMap(
  cache: MapEventsCache | undefined,
  eventId: string,
  next: AttendanceType | null,
  delta: number,
  me: FeedAuthor | null,
): MapEventsCache | undefined {
  if (!cache) return cache
  return {
    ...cache,
    data: cache.data.map(event => {
      if (event.id !== eventId) return event
      const attending = next === 'CONFIRMED' || next === 'INTERESTED'
      let top = event.topAttendances ?? []
      if (me) {
        const present = top.some(a => a.user.id === me.id)
        if (attending && !present) top = [...top, { user: me }].slice(0, 5)
        else if (!attending && present)
          top = top.filter(a => a.user.id !== me.id)
      }
      return {
        ...event,
        userAttendance: next,
        topAttendances: top,
        _count: {
          ...event._count,
          attendances: event._count.attendances + delta,
        },
      }
    }),
  }
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
  const me = currentUser(queryClient)
  queryClient.setQueriesData<MapEventsCache>({ queryKey: mapKey }, old =>
    patchEventInMap(old, eventId, next, delta, me),
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
  snapshot.prevMap.forEach(([key, data]) => queryClient.setQueryData(key, data))
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
    await queryClient.cancelQueries({ queryKey: mapKey })
    await queryClient.cancelQueries({ queryKey: detailKey })
    const prevFeeds: FeedSnapshot = queryClient.getQueriesData<FeedCache>({
      queryKey: feedKey,
    })
    const prevMap: MapSnapshot = queryClient.getQueriesData<MapEventsCache>({
      queryKey: mapKey,
    })
    const prevDetail = queryClient.getQueryData<EventDetail>(detailKey)
    const current =
      prevDetail?.userAttendance ??
      findInFeeds(prevFeeds, eventId)?.userAttendance ??
      null
    return { snap: { prevFeeds, prevMap, prevDetail }, current }
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
