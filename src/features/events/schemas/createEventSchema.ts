import { z } from 'zod'

export const createEventSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter ao menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
    .optional()
    .or(z.literal('')),
  date: z.date({ error: 'Data do evento é obrigatória' }),
  address: z
    .string()
    .max(255, 'Endereço deve ter no máximo 255 caracteres')
    .min(1, 'Selecione um local no mapa'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  category: z.string().min(1, 'Categoria é obrigatória'),
  isPublic: z.boolean(),
})

export type CreateEventInput = z.infer<typeof createEventSchema>

export type CreateEventPayload = Omit<
  CreateEventInput,
  'date' | 'description'
> & {
  date: string
  description?: string
}
