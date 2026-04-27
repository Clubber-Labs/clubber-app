import { z } from 'zod'

export const attendanceSchema = z.object({
  type: z.enum(['INTERESTED', 'CONFIRMED', 'NOT_INTERESTED']),
})

export type AttendanceInput = z.infer<typeof attendanceSchema>
