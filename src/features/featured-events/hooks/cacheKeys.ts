export const featuredKeys = {
  all: ['featured-events'] as const,
  active: (eventId: string) => ['featured-events', eventId, 'active'] as const,
}
