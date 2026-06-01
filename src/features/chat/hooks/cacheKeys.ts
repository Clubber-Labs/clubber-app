export const chatKeys = {
  inbox: ['chat', 'inbox'] as const,
  conversation: (id: string) => ['chat', 'conversation', id] as const,
  messages: (id: string) => ['chat', 'messages', id] as const,
  blocks: ['chat', 'blocks'] as const,
}
