import { z } from 'zod'

// PATCH /spots/:id só aceita título e descrição (lugar/horário/categorias são
// imutáveis após publicar).
export const editSpotSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter ao menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
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
