import { z } from 'zod'

// PATCH /spots/:id só aceita título e descrição (lugar/horário/categorias são
// imutáveis após publicar).
export const editSpotSchema = z.object({
  title: z
    .string()
    .min(3, 'spots.errors.titleMin')
    .max(100, 'spots.errors.titleMax'),
  description: z
    .string()
    .max(2000, 'spots.errors.descriptionMax')
    .optional()
    .or(z.literal('')),
})

export type EditSpotInput = z.infer<typeof editSpotSchema>

export type UpdateSpotPayload = {
  title: string
  // null limpa a descrição no backend — '' viraria string vazia persistida.
  description: string | null
}

export function toUpdateSpotPayload(data: EditSpotInput): UpdateSpotPayload {
  const trimmed = data.description?.trim()
  return {
    title: data.title,
    description: trimmed ? trimmed : null,
  }
}
