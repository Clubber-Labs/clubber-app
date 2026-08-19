import { useState, useCallback } from 'react'
import { Share } from 'react-native'
import { useTranslation } from 'react-i18next'
import { eventAnalyticsService } from '../services/eventAnalyticsService'

// Orquestra o export do CSV: busca via service e abre o share sheet nativo.
// Mantém o componente fora da camada de serviço (tela → hook → service), mesmo
// padrão do export de dados LGPD (useExportConsentData).
export function useExportEventAnalytics(eventId: string) {
  const { t } = useTranslation()
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportCsv = useCallback(async () => {
    setExporting(true)
    setError(null)
    try {
      const csv = await eventAnalyticsService.exportCsv(eventId)
      await Share.share({
        title: t('analytics.exportTitle'),
        message: csv,
      })
    } catch {
      setError(t('analytics.exportError'))
    } finally {
      setExporting(false)
    }
  }, [eventId, t])

  return { exportCsv, exporting, error }
}
