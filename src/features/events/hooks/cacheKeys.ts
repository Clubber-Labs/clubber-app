import type { QueryClient } from '@tanstack/react-query'
import type { CommentTarget } from '../services/eventsService'

// Thread de respostas. Vive aqui, e não dentro do hook, porque o tap na
// notificação pré-busca a raiz antes de navegar — os dois precisam da MESMA
// chave, senão a tela abre fria e refaz a requisição que acabou de acontecer.
const commentTargetKey = (target: CommentTarget) =>
  target.kind === 'event'
    ? ['events', target.eventId]
    : ['posts', target.postId]

export const commentKeys = {
  // Raízes do alvo. Em evento a chave é a mesma de sempre
  // (['events', id, 'comments']) — invalidações existentes seguem valendo.
  list: (target: CommentTarget) => [...commentTargetKey(target), 'comments'],
  detail: (target: CommentTarget, commentId: string) => [
    ...commentTargetKey(target),
    'comment',
    commentId,
  ],
  replies: (target: CommentTarget, parentId: string) => [
    ...commentTargetKey(target),
    'comment',
    parentId,
    'replies',
  ],
}

export const eventKeys = {
  all: ['events'] as const,
  detail: (id: string) => ['events', id] as const,
  list: ['events', 'list'] as const,
  comments: (id: string) => ['events', id, 'comments'] as const,
  posts: (id: string) => ['events', id, 'posts'] as const,
}

export const feedKey = ['feed'] as const

export function invalidateEventViews(
  queryClient: QueryClient,
  eventId?: string,
  // Em mutations otimistas in-place (presença) o card já reflete a mudança;
  // refetch ativo do feed só reordenaria o item na hora. 'none' marca stale →
  // reordena no próximo refresh/fetch. Edição/upload usam 'active' (conteúdo
  // mudou e não está refletido no cache do feed).
  feedRefetch: 'active' | 'none' = 'active',
) {
  queryClient.invalidateQueries({ queryKey: feedKey, refetchType: feedRefetch })
  queryClient.invalidateQueries({ queryKey: eventKeys.list })
  queryClient.invalidateQueries({ queryKey: ['map-events'] })
  queryClient.invalidateQueries({ queryKey: ['heatmap'] })
  if (eventId) {
    queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
  }
}
