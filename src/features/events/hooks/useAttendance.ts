import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import type { AttendanceType } from '@/shared/types'

export function useSetAttendance(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (type: AttendanceType) =>
      eventsService.setAttendance(eventId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useCancelAttendance(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => eventsService.cancelAttendance(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}
