import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  changeLocale,
  isSupportedLocale,
  toBackendLocale,
  FALLBACK_LOCALE,
  type Locale,
} from '@/shared/i18n'
import { useMyProfile, useUpdateProfile } from './useProfile'

/**
 * Troca de idioma nas duas pontas: aparelho (SecureStore + i18next) e servidor
 * (`localePreference` do perfil). As duas são necessárias — o header
 * Accept-Language cobre só o conteúdo pedido em request; push e e-mail saem de
 * job, e leem a preferência salva.
 *
 * Otimista com revert, como toda troca visualmente reversível do app: a
 * interface muda no toque e volta se o PUT falhar. Aqui o revert vale mais que
 * de costume — manter o aparelho num idioma e o servidor em outro seria uma
 * divergência permanente e invisível (interface em inglês, push em português).
 * O erro é RE-LANÇADO para a tela mostrar, no mesmo modelo do useSpotPrefs.
 */
export function useLocalePreference() {
  const { i18n } = useTranslation()
  const { data: profile } = useMyProfile()
  const update = useUpdateProfile(profile?.id ?? '')

  const current: Locale = isSupportedLocale(i18n.language)
    ? i18n.language
    : FALLBACK_LOCALE

  const select = useCallback(
    async (next: Locale) => {
      if (next === current || !profile) return
      await changeLocale(next)
      try {
        await update.mutateAsync({ localePreference: toBackendLocale(next) })
      } catch (err) {
        await changeLocale(current)
        throw err
      }
    },
    [current, profile, update],
  )

  return { current, select, saving: update.isPending, ready: !!profile }
}
