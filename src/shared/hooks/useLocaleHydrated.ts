import { useEffect, useState } from 'react'
import { hydratePersistedLocale } from '@/shared/i18n'

// Segura a splash até a preferência salva ser aplicada — sem isso um usuário que
// escolheu outro idioma vê um frame no idioma do aparelho.
export function useLocaleHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    hydratePersistedLocale().finally(() => setHydrated(true))
  }, [])

  return hydrated
}
