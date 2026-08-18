import { useTranslation } from 'react-i18next'

// Componente que só formata (sem copy) não se inscreve no i18next sozinho e
// ficaria com o formato velho depois da troca de idioma. Este hook é a
// subscrição: quem formata data/número passa por aqui.
export function useLocale(): string {
  const { i18n } = useTranslation()
  return i18n.language
}
