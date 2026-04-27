import { z } from 'zod'

export const postSchema = z.object({
  content: z
    .string()
    .min(1, 'Post não pode ser vazio')
    .max(500, 'Post deve ter no máximo 500 caracteres'),
})

export type PostInput = z.infer<typeof postSchema>
