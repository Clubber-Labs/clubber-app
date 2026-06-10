import { useMutation } from '@tanstack/react-query'
import { reportsService } from '../services/reportsService'
import type { ReportReason, ReportTarget } from '../types'

type CreateReportVars = {
  target: ReportTarget
  reason: ReportReason
  details?: string
}

// Criação de denúncia para qualquer alvo (evento, comentário, mensagem,
// usuário). Sem optimistic update: é uma ação pontual de submit — o feedback
// vem por banner no orquestrador (useReportFlow). Erro 409 = denúncia
// duplicada, tratado por quem consome.
export function useCreateReport() {
  return useMutation({
    mutationFn: (vars: CreateReportVars) => reportsService.create(vars),
  })
}
