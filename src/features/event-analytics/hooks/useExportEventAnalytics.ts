import { useState, useCallback } from 'react'
import { Share } from 'react-native'
import { eventAnalyticsService } from '../services/eventAnalyticsService'

// Orquestra o export do CSV: busca via service e abre o share sheet nativo.
// Mantém o componente fora da camada de serviço (tela → hook → service), mesmo
// padrão do export de dados LGPD (useExportConsentData).
export function useExportEventAnalytics(eventId: string) {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportCsv = useCallback(async () => {
    setExporting(true)
    setError(null)
    try {
      const csv = await eventAnalyticsService.exportCsv(eventId)
      await Share.share({
        title: 'Analytics do evento — Clubber',
        message: csv,
      })
    } catch {
      setError('Não foi possível exportar agora. Tente novamente.')
    } finally {
      setExporting(false)
    }
  }, [eventId])

  return { exportCsv, exporting, error }
}
