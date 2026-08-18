import { z } from 'zod'

// Teto da janela do spot: endsAt não pode passar de agora + 24h. O backend
// ainda aceita janelas maiores, mas a validação chega no PR de lifecycle —
// o client já constrói com o limite pra não retrabalhar.
export const SPOT_MAX_WINDOW_MS = 24 * 60 * 60 * 1000

export const createSpotSchema = z
  .object({
    title: z
      .string()
      .min(3, 'spots.errors.titleMin')
      .max(100, 'spots.errors.titleMax'),
    description: z
      .string()
      .max(2000, 'spots.errors.descriptionMax')
      .optional()
      .or(z.literal('')),
    categories: z
      .array(z.string())
      .min(1, 'spots.errors.categoriesMin')
      .max(5, 'spots.errors.categoriesMax'),
    // Subcategorias/gêneros (chaves de 2º nível). Coerência garantida na UI
    // (SubcategorySelect). Imutável após a criação — não há edição. O form provê
    // o default [] (como categories, é sempre presente nos values).
    subcategories: z.array(z.string()).max(10, 'spots.errors.subcategoriesMax'),
    visibility: z.enum(['PUBLIC', 'FRIENDS']),
    // Herdados do candidato escolhido — não são editáveis no form.
    placeId: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    startsAt: z.date({ error: 'spots.errors.startsAtRequired' }),
    endsAt: z.date({ error: 'spots.errors.endsAtRequired' }),
  })
  .refine(data => data.endsAt > data.startsAt, {
    message: 'spots.errors.endsAfterStart',
    path: ['endsAt'],
  })
  .refine(data => data.endsAt.getTime() > Date.now(), {
    message: 'spots.errors.endsInFuture',
    path: ['endsAt'],
  })
  .refine(data => data.endsAt.getTime() <= Date.now() + SPOT_MAX_WINDOW_MS, {
    message: 'spots.errors.windowTooLong',
    path: ['endsAt'],
  })

export type CreateSpotInput = z.infer<typeof createSpotSchema>

export type CreateSpotPayload = Omit<
  CreateSpotInput,
  'startsAt' | 'endsAt' | 'description' | 'subcategories'
> & {
  startsAt: string
  endsAt: string
  description?: string
  subcategories?: string[]
}

export function toSpotPayload(data: CreateSpotInput): CreateSpotPayload {
  const { description, subcategories, ...rest } = data
  const trimmed = description?.trim()
  return {
    ...rest,
    startsAt: data.startsAt.toISOString(),
    endsAt: data.endsAt.toISOString(),
    // Campos opcionais no POST — omite quando vazios em vez de mandar vazio.
    ...(trimmed ? { description: trimmed } : {}),
    ...(subcategories.length ? { subcategories } : {}),
  }
}
