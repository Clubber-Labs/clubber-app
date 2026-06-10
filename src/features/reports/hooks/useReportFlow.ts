import { useState } from 'react'
import { useBanner } from '@/shared/lib/banner'
import { getApiError, isConflictError } from '@/shared/lib/apiError'
import { useCreateReport } from './useCreateReport'
import type { ReportReason, ReportTarget } from '../types'

// Orquestra o fluxo de denúncia reaproveitável pelas telas/itens: guarda o alvo
// aberto, controla o sheet e aplica os efeitos (banner de sucesso/erro). A
// decisão de UI fica nos componentes; aqui só os side-effects.
export function useReportFlow() {
  const [target, setTarget] = useState<ReportTarget | null>(null)
  const showBanner = useBanner()
  const create = useCreateReport()

  function submit(reason: ReportReason, details?: string) {
    if (!target) return
    create.mutate(
      { target, reason, details },
      {
        onSuccess: () => showBanner('Denúncia enviada. Obrigado.'),
        onError: e =>
          showBanner(
            // 409 = já existe denúncia ativa do usuário para este item.
            isConflictError(e)
              ? 'Você já possui uma denúncia ativa para este item.'
              : getApiError(e).message,
          ),
      },
    )
    setTarget(null)
  }

  return {
    target,
    requestReport: (next: ReportTarget) => setTarget(next),
    close: () => setTarget(null),
    submit,
    isPending: create.isPending,
  }
}
