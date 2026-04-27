import { z } from 'zod'

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comentário não pode ser vazio')
    .max(500, 'Comentário deve ter no máximo 500 caracteres'),
})

export type CommentInput = z.infer<typeof commentSchema>
