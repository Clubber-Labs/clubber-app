import { z } from 'zod'
import { editProfileSchema } from '@/features/users/schemas/editProfileSchema'

// Estende o editProfileSchema tornando birthdate obrigatório. No editProfile
// regular é opcional (o user já tinha registrado), mas no fluxo social ele
// PRECISA preencher antes de liberar o app.
export const completeProfileSchema = editProfileSchema.extend({
  birthdate: z.date({ message: 'Data de nascimento é obrigatória' }),
})

export type CompleteProfileInput = z.infer<typeof completeProfileSchema>
