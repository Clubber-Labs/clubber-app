// O Hermes do Android não expõe Intl.PluralRules; sem o polyfill o i18next
// aplica regra de plural inglesa a todo idioma. Tem que vir antes do init.
import 'intl-pluralrules'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getLocales } from 'expo-localization'
import {
  getLocalePreference,
  saveLocalePreference,
} from '@/shared/lib/secureStore'
import en from './locales/en.json'
import es from './locales/es.json'
import pt from './locales/pt.json'

export const SUPPORTED_LOCALES = ['pt', 'en', 'es'] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

// Espelha o FALLBACK_LOCALE do backend, que cai em inglês para idioma concreto
// sem dicionário. Cair em 'pt' aqui deixaria um aparelho francês com a interface
// em português e notificação/categoria em inglês na mesma tela.
export const FALLBACK_LOCALE: Locale = 'en'

export type MeasurementSystem = 'metric' | 'us' | 'uk'

// `Record` (e não um objeto solto) é o que faz `pnpm typecheck` acusar chave
// faltando em en/es: os três dicionários têm que ter o formato do canônico.
const resources: Record<Locale, { translation: typeof pt }> = {
  pt: { translation: pt },
  en: { translation: en },
  es: { translation: es },
}

export function isSupportedLocale(value: unknown): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale)
}

// Mesma regra do resolveLocale do backend: pt* → pt · es* → es · resto → en.
export function resolveLocale(languageCode: string | null | undefined): Locale {
  if (languageCode === 'pt') return 'pt'
  if (languageCode === 'es') return 'es'
  return FALLBACK_LOCALE
}

export function getDeviceLocale(): Locale {
  return resolveLocale(getLocales()[0]?.languageCode)
}

// Sistema de medida é do aparelho, não do idioma: es-US quer milhas tanto quanto
// en-US. Consumido pela formatação de distância.
export function getMeasurementSystem(): MeasurementSystem {
  return getLocales()[0]?.measurementSystem ?? 'metric'
}

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLocale(),
  fallbackLng: FALLBACK_LOCALE,
  supportedLngs: [...SUPPORTED_LOCALES],
  // RN não é HTML — escapar viraria &amp; na tela.
  interpolation: { escapeValue: false },
})

// A escolha do usuário vence o idioma do aparelho, mas o SecureStore é async e o
// boot não pode esperar I/O pra ter `t` — por isso o init sobe com o idioma do
// aparelho e a preferência é aplicada logo depois.
export async function hydratePersistedLocale(): Promise<void> {
  const stored = await getLocalePreference()
  if (isSupportedLocale(stored) && stored !== i18n.language) {
    await i18n.changeLanguage(stored)
  }
}

// Ainda falta propagar a escolha para o backend (`PUT /users/{id}` com
// `localePreference`): push e e-mail são renderizados no servidor pela
// preferência salva, não pelo Accept-Language.
export async function changeLocale(locale: Locale): Promise<void> {
  await saveLocalePreference(locale)
  await i18n.changeLanguage(locale)
}

export { i18n }
