import { z } from 'zod'

export const createEventSchema = z
  .object({
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
    endDate: z.date().optional(),
    address: z
      .string()
      .max(255, 'Endereço deve ter no máximo 255 caracteres')
      .min(1, 'Selecione um local no mapa'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    category: z.string().min(1, 'Categoria é obrigatória'),
    isPublic: z.boolean(),
  })
  .refine(data => !data.endDate || data.endDate > data.date, {
    message: 'Horário de término deve ser depois do início',
    path: ['endDate'],
  })

export type CreateEventInput = z.infer<typeof createEventSchema>

export type CreateEventPayload = Omit<
  CreateEventInput,
  'date' | 'endDate' | 'description'
> & {
  date: string
  endDate?: string
  description?: string
}

export function toEventPayload(data: CreateEventInput): CreateEventPayload {
  const { endDate, ...rest } = data
  return {
    ...rest,
    date: data.date.toISOString(),
    // Sempre envia string (vazia inclusive) pra que o PUT consiga limpar
    // a descrição — campo omitido seria interpretado como "manter".
    description: data.description?.trim() ?? '',
    ...(endDate ? { endDate: endDate.toISOString() } : {}),
  }
}

export type UpdateEventPayload = Omit<CreateEventPayload, 'address'>

// PUT /events/:id não aceita `address` (nem `maxCapacity`) — campos extras são
// ignorados pelo backend. Omitimos `address` para refletir o contrato.
export function toUpdateEventPayload(
  data: CreateEventInput,
): UpdateEventPayload {
  const { address: _address, ...rest } = toEventPayload(data)
  return rest
}
