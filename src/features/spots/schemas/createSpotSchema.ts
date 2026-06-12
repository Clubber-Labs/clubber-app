import { z } from 'zod'

// Teto da janela do spot: endsAt não pode passar de agora + 24h. O backend
// ainda aceita janelas maiores, mas a validação chega no PR de lifecycle —
// o client já constrói com o limite pra não retrabalhar.
export const SPOT_MAX_WINDOW_MS = 24 * 60 * 60 * 1000

export const createSpotSchema = z
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
    categories: z
      .array(z.string())
      .min(1, 'Selecione ao menos uma categoria')
      .max(5, 'Selecione no máximo 5 categorias'),
    visibility: z.enum(['PUBLIC', 'FRIENDS']),
    // Herdados do candidato escolhido — não são editáveis no form.
    placeId: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    startsAt: z.date({ error: 'Horário de início é obrigatório' }),
    endsAt: z.date({ error: 'Horário de término é obrigatório' }),
  })
  .refine(data => data.endsAt > data.startsAt, {
    message: 'Horário de término deve ser depois do início',
    path: ['endsAt'],
  })
  .refine(data => data.endsAt.getTime() > Date.now(), {
    message: 'O rolê precisa terminar no futuro',
    path: ['endsAt'],
  })
  .refine(data => data.endsAt.getTime() <= Date.now() + SPOT_MAX_WINDOW_MS, {
    message: 'O rolê pode durar no máximo 24 horas a partir de agora',
    path: ['endsAt'],
  })

export type CreateSpotInput = z.infer<typeof createSpotSchema>

export type CreateSpotPayload = Omit<
  CreateSpotInput,
  'startsAt' | 'endsAt' | 'description'
> & {
  startsAt: string
  endsAt: string
  description?: string
}

export function toSpotPayload(data: CreateSpotInput): CreateSpotPayload {
  const { description, ...rest } = data
  const trimmed = description?.trim()
  return {
    ...rest,
    startsAt: data.startsAt.toISOString(),
    endsAt: data.endsAt.toISOString(),
    // Campo opcional no POST — omite quando vazio em vez de mandar ''.
    ...(trimmed ? { description: trimmed } : {}),
  }
}
