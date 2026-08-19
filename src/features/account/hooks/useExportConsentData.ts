import { useCallback, useState } from 'react'
import { Share } from 'react-native'
import { useTranslation } from 'react-i18next'
import { consentService } from '@/features/privacy/services/consentService'

// Reusa o export de consentimento (GET /consent/export) — cobre SÓ o histórico de
// consentimento (não eventos/posts/mensagens). A UI rotula isso honestamente.
export function useExportConsentData() {
  const { t } = useTranslation()
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportData = useCallback(async () => {
    setExporting(true)
    setError(null)
    try {
      const data = await consentService.export()
      await Share.share({
        title: t('privacy.exportTitle'),
        message: JSON.stringify(data, null, 2),
      })
    } catch {
      setError(t('privacy.exportError'))
    } finally {
      setExporting(false)
    }
  }, [t])

  return { exportData, exporting, error }
}
