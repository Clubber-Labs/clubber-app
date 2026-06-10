import type { ReportStatus } from '../types'

export const reportKeys = {
  all: ['reports'] as const,
  list: (status?: ReportStatus) =>
    ['reports', 'list', status ?? 'ALL'] as const,
  detail: (id: string) => ['reports', 'detail', id] as const,
}
