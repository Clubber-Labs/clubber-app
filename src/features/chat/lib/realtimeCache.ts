import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import type { CursorPaginatedResponse } from '@/shared/types'
import { chatKeys } from '../hooks/cacheKeys'
import type { ChatMessage, InboxItem, Message } from '../types'

export type MsgCache = InfiniteData<CursorPaginatedResponse<ChatMessage>>
export type InboxCache = InfiniteData<CursorPaginatedResponse<InboxItem>>

function messageExists(cache: MsgCache, id: string): boolean {
  return cache.pages.some(page => page.data.some(m => m.id === id))
}

// Insere/atualiza uma mensagem no cache da conversa, lidando com as duas ordens
// possíveis em relação ao envio otimista:
//  1) já existe (id) → ignora (dedup do eco do socket);
//  2) é minha e há uma bolha otimista 'sending' equivalente → substitui (socket
//     chegou antes do 201);
//  3) caso contrário → prepend na página 0 (mais recente).
export function upsertMessage(
  cache: MsgCache,
  message: ChatMessage,
  myId: string,
): MsgCache {
  if (messageExists(cache, message.id)) return cache

  if (message.senderId === myId) {
    let replaced = false
    const pages = cache.pages.map(page => {
      if (replaced) return page
      const idx = page.data.findIndex(
        m =>
          m.clientStatus === 'sending' &&
          m.senderId === myId &&
          m.content === message.content,
      )
      if (idx === -1) return page
      replaced = true
      const data = [...page.data]
      data[idx] = { ...message, clientStatus: 'sent' }
      return { ...page, data }
    })
    if (replaced) return { ...cache, pages }
  }

  const [first, ...rest] = cache.pages
  if (!first) return cache
  return {
    ...cache,
    pages: [{ ...first, data: [message, ...first.data] }, ...rest],
  }
}

export function applyIncomingMessage(
  queryClient: QueryClient,
  message: Message,
  myId: string,
) {
  queryClient.setQueryData<MsgCache>(
    chatKeys.messages(message.conversationId),
    prev => (prev ? upsertMessage(prev, message, myId) : prev),
  )
}

export function inboxHasConversation(
  queryClient: QueryClient,
  conversationId: string,
): boolean {
  const cache = queryClient.getQueryData<InboxCache>(chatKeys.inbox)
  if (!cache) return false
  return cache.pages.some(page =>
    page.data.some(c => c.id === conversationId),
  )
}

// Move a conversa pro topo, atualiza lastMessage e incrementa unread (exceto se
// a mensagem é minha ou a conversa está ativa na tela).
export function applyMessageToInbox(
  queryClient: QueryClient,
  message: Message,
  myId: string,
  isActive: boolean,
) {
  queryClient.setQueryData<InboxCache>(chatKeys.inbox, prev => {
    if (!prev) return prev
    let target: InboxItem | undefined
    for (const page of prev.pages) {
      const item = page.data.find(c => c.id === message.conversationId)
      if (item) {
        target = item
        break
      }
    }
    if (!target) return prev

    const skipUnread = message.senderId === myId || isActive
    const updated: InboxItem = {
      ...target,
      lastMessage: message,
      lastMessageAt: message.createdAt,
      unreadCount: skipUnread ? target.unreadCount : target.unreadCount + 1,
    }

    const pages = prev.pages.map(page => ({
      ...page,
      data: page.data.filter(c => c.id !== message.conversationId),
    }))
    const [first, ...rest] = pages
    return {
      ...prev,
      pages: [{ ...first, data: [updated, ...first.data] }, ...rest],
    }
  })
}

const EMPTY_MSG_CACHE: MsgCache = {
  pages: [{ data: [], nextCursor: null }],
  pageParams: [undefined],
}

// Insere a bolha otimista no topo (página 0), ou — no retry — substitui in-place
// o temp existente com o mesmo clientId (evita duplicar). Cria um cache mínimo
// se a conversa ainda não tem mensagens carregadas (conversa nova/vazia).
export function upsertOptimistic(
  cache: MsgCache | undefined,
  message: ChatMessage,
): MsgCache {
  const base = cache ?? EMPTY_MSG_CACHE
  const exists =
    !!message.clientId &&
    base.pages.some(p => p.data.some(m => m.clientId === message.clientId))
  if (exists) {
    return {
      ...base,
      pages: base.pages.map(page => ({
        ...page,
        data: page.data.map(m =>
          m.clientId === message.clientId ? message : m,
        ),
      })),
    }
  }
  const [first, ...rest] = base.pages
  return {
    ...base,
    pages: [{ ...first, data: [message, ...first.data] }, ...rest],
  }
}

// 201 recebido: troca o temp pelo Message real. Se o real já entrou pelo socket
// (eco chegou antes), só descarta o temp pra não duplicar.
export function reconcileSent(
  cache: MsgCache | undefined,
  clientId: string,
  real: Message,
): MsgCache | undefined {
  if (!cache) return cache
  const realExists = cache.pages.some(p => p.data.some(m => m.id === real.id))
  let inserted = false
  const pages = cache.pages.map(page => {
    const data: ChatMessage[] = []
    for (const m of page.data) {
      if (m.clientId === clientId) {
        if (!realExists && !inserted) {
          data.push({ ...real, clientStatus: 'sent' })
          inserted = true
        }
        continue
      }
      data.push(m)
    }
    return { ...page, data }
  })
  return { ...cache, pages }
}

export function markFailed(
  cache: MsgCache | undefined,
  clientId: string,
): MsgCache | undefined {
  if (!cache) return cache
  return {
    ...cache,
    pages: cache.pages.map(page => ({
      ...page,
      data: page.data.map(m =>
        m.clientId === clientId
          ? { ...m, clientStatus: 'failed' as const }
          : m,
      ),
    })),
  }
}

export function resetInboxUnread(
  queryClient: QueryClient,
  conversationId: string,
) {
  queryClient.setQueryData<InboxCache>(chatKeys.inbox, prev => {
    if (!prev) return prev
    return {
      ...prev,
      pages: prev.pages.map(page => ({
        ...page,
        data: page.data.map(c =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c,
        ),
      })),
    }
  })
}
