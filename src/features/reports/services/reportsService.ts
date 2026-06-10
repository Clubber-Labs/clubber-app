import { api } from '@/shared/lib/api'
import type { Report, ReportReason, ReportStatus, ReportTarget } from '../types'

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
    case 'comment':
      return `/comments/${target.id}/report`
    case 'message':
      return `/messages/${target.id}/report`
    case 'user':
      return `/users/${target.id}/report`
  }
}

// GET /reports pode responder como array puro ou envelopado ({ data: [...] }).
// Normaliza pra Report[] e mantém o resto do app indiferente ao formato exato.
function toReportList(data: unknown): Report[] {
  if (Array.isArray(data)) return data as Report[]
  if (data && typeof data === 'object' && 'data' in data) {
    const inner = (data as { data: unknown }).data
    if (Array.isArray(inner)) return inner as Report[]
  }
  return []
}

export const reportsService = {
  create: ({ target, reason, details }: CreatePayload): Promise<void> =>
    api
      .post(reportPath(target), {
        reason,
        ...(details ? { details } : {}),
      })
      .then(() => undefined),

  list: (status?: ReportStatus): Promise<Report[]> =>
    api
      .get('/reports', {
        params: { ...(status ? { status } : {}) },
      })
      .then(r => toReportList(r.data)),

  getById: (id: string): Promise<Report> =>
    api.get(`/reports/${id}`).then(r => r.data),

  updateStatus: (id: string, status: ReportStatus): Promise<Report> =>
    api.patch(`/reports/${id}`, { status }).then(r => r.data),

  removeTarget: (id: string): Promise<Report> =>
    api.delete(`/reports/${id}/target`).then(r => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/reports/${id}`).then(() => undefined),
}
