import { z } from 'zod'

export const postSchema = z.object({
  content: z
    .string()
    .min(1, 'Post não pode ser vazio')
    .max(1000, 'Post deve ter no máximo 1000 caracteres'),
})

export type PostInput = z.infer<typeof postSchema>
