import { api } from '@/shared/lib/api'
import type { ReportReason } from '../types'

export const reportsService = {
  reportMessage: (
    messageId: string,
    reason: ReportReason,
    details?: string,
  ): Promise<void> =>
    api
      .post(`/messages/${messageId}/report`, {
        reason,
        ...(details ? { details } : {}),
      })
      .then(() => undefined),
}
