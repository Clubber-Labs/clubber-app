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
      .min(1, 'Selecione um local no campo de busca'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    categories: z.array(z.string()).min(1, 'Selecione ao menos uma categoria'),
    // Subcategorias/gêneros (chaves de 2º nível). Coerência garantida na UI
    // (SubcategorySelect); o array é sempre enviado para o PUT substituir. O
    // form provê o default [] (como categories, é sempre presente nos values).
    subcategories: z.array(z.string()).max(10, 'No máximo 10 interesses'),
    isPublic: z.boolean(),
    // Estabelecimento (Google Places). Presentes juntos quando o usuário
    // escolhe um lugar na busca; ausentes/null no fluxo de endereço manual.
    placeId: z.string().nullish(),
    venueName: z.string().nullish(),
  })
  .refine(data => !data.endDate || data.endDate > data.date, {
    message: 'Horário de término deve ser depois do início',
    path: ['endDate'],
  })

export type CreateEventInput = z.infer<typeof createEventSchema>

type EventBasePayload = {
  title: string
  description?: string
  date: string
  endDate?: string
  address: string
  latitude: number
  longitude: number
  categories: string[]
  subcategories: string[]
  isPublic: boolean
}

export type CreateEventPayload = EventBasePayload & {
  placeId?: string
  venueName?: string
}

// No PUT, placeId/venueName são sempre enviados: os valores fixam o
// estabelecimento, `null` limpa os dois e volta o evento pra endereço de rua.
export type UpdateEventPayload = EventBasePayload & {
  placeId: string | null
  venueName: string | null
}

function toBasePayload(data: CreateEventInput): EventBasePayload {
  const { endDate } = data
  return {
    title: data.title,
    // Sempre envia string (vazia inclusive) pra que o PUT consiga limpar
    // a descrição — campo omitido seria interpretado como "manter".
    description: data.description?.trim() ?? '',
    date: data.date.toISOString(),
    ...(endDate ? { endDate: endDate.toISOString() } : {}),
    address: data.address,
    latitude: data.latitude,
    longitude: data.longitude,
    categories: data.categories,
    subcategories: data.subcategories,
    isPublic: data.isPublic,
  }
}

export function toEventPayload(data: CreateEventInput): CreateEventPayload {
  const base = toBasePayload(data)
  // Estabelecimento só acompanha o POST quando escolhido; no endereço manual
  // os campos são omitidos (não enviar é o contrato do "sem estabelecimento").
  return data.placeId && data.venueName
    ? { ...base, placeId: data.placeId, venueName: data.venueName }
    : base
}

export function toUpdateEventPayload(
  data: CreateEventInput,
): UpdateEventPayload {
  return {
    ...toBasePayload(data),
    placeId: data.placeId ?? null,
    venueName: data.venueName ?? null,
  }
}
