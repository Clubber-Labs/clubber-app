import { api } from '@/shared/lib/api'
import type { CreateEventInput } from '../schemas/createEventSchema'

export const eventsService = {
  list: () => api.get('/events').then(r => r.data),
  getById: (id: string) => api.get(`/events/${id}`).then(r => r.data),
  create: (data: CreateEventInput) =>
    api.post('/events', data).then(r => r.data),
}
