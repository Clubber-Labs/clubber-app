import { api } from '@/shared/lib/api'
import type { ReportReason, ReportTarget } from '../types'

type CreatePayload = {
  target: ReportTarget
  reason: ReportReason
  details?: string
}

// Endpoint de criação por tipo de alvo. Cada alvo tem sua rota dedicada
// (espelha o backend); o body é sempre { reason, details? }.
function reportPath(target: ReportTarget): string {
  switch (target.type) {
    case 'event':
      return `/events/${target.id}/report`
    case 'post':
      return `/posts/${target.id}/report`
    case 'comment':
      return `/comments/${target.id}/report`
    case 'message':
      return `/messages/${target.id}/report`
    case 'user':
      return `/users/${target.id}/report`
  }
}

export const reportsService = {
  create: ({ target, reason, details }: CreatePayload): Promise<void> =>
    api
      .post(reportPath(target), {
        reason,
        ...(details ? { details } : {}),
      })
      .then(() => undefined),
}
