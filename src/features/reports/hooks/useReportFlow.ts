import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBanner } from '@/shared/lib/banner'
import { getApiError } from '@/shared/lib/apiError'
import { useCreateReport } from './useCreateReport'
import type { ReportReason, ReportTarget } from '../types'

// Orquestra o fluxo de denúncia reaproveitável pelas telas/itens: guarda o alvo
// aberto, controla o sheet e aplica os efeitos (banner de sucesso/erro). A
// decisão de UI fica nos componentes; aqui só os side-effects.
export function useReportFlow() {
  const { t } = useTranslation()
  const [target, setTarget] = useState<ReportTarget | null>(null)
  const showBanner = useBanner()
  const create = useCreateReport()

  function submit(reason: ReportReason, details?: string) {
    if (!target) return
    create.mutate(
      { target, reason, details },
      {
        onSuccess: () => showBanner(t('reports.sent')),
        // O 409 de denúncia repetida chega como REPORT_ALREADY_OPEN — o
        // getApiError já o traduz, sem ramo especial aqui.
        onError: e => showBanner(getApiError(e).message),
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
