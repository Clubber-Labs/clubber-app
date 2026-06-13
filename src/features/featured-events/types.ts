export type FeaturedEvent = {
  id: string
  eventId: string
  startsAt: string
  endsAt: string
  createdBy: string
  canceledAt: string | null
  createdAt: string
}

export type CreateFeaturedEventInput = {
  startsAt: string // ISO datetime
  endsAt: string // ISO datetime
}
