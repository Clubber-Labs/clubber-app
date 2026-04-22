import { z } from 'zod'

export const createEventSchema = z.object({
  title: z.string().min(3),
  date: z.string().datetime(),
  isPublic: z.boolean(),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
