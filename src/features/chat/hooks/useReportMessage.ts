import { useMutation } from '@tanstack/react-query'
import { reportsService } from '../services/reportsService'
import type { ReportReason } from '../types'

type ReportVars = {
  messageId: string
  reason: ReportReason
  details?: string
}

export function useReportMessage() {
  return useMutation({
    mutationFn: ({ messageId, reason, details }: ReportVars) =>
      reportsService.reportMessage(messageId, reason, details),
  })
}
