import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsService } from '../services/reportsService'
import { reportKeys } from './cacheKeys'
import type { Report } from '../types'

export function useRemoveReportTarget(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => reportsService.removeTarget(id),
    onSuccess: updated => {
      queryClient.setQueryData<Report>(reportKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
    },
  })
}
