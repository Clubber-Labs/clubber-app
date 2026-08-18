import { useCallback, useMemo } from 'react'
import { getMeasurementSystem } from '@/shared/i18n'
import { formatDistance } from '@/shared/utils/distance'
import { useLocale } from './useLocale'

// Idioma e sistema de medida são eixos independentes: o primeiro reage à troca
// no app, o segundo é ajuste de sistema operacional e não muda em runtime.
export function useFormatDistance() {
  const locale = useLocale()
  const system = useMemo(() => getMeasurementSystem(), [])

  return useCallback(
    (km: number) => formatDistance(km, locale, system),
    [locale, system],
  )
}
