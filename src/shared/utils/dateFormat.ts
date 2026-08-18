import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'
import { enUS, es, ptBR } from 'date-fns/locale'
import type { Locale as DateFnsLocale } from 'date-fns'
import { TZDate } from '@date-fns/tz'
import { i18n, type Locale } from '@/shared/i18n'

// Mapa estático: o Metro não resolve import dinâmico de caminho montado em
// runtime, então `import('date-fns/locale/' + l)` não funciona aqui.
const DATE_FNS_LOCALES: Record<Locale, DateFnsLocale> = {
  pt: ptBR,
  en: enUS,
  es,
}

// Exportado porque `isThisWeek`/`startOfWeek` precisam do locale direto: o
// início da semana é cultural, não linguístico.
export function dateFnsLocale(locale: string): DateFnsLocale {
  return DATE_FNS_LOCALES[locale as Locale] ?? DATE_FNS_LOCALES.en
}

type DateInput = string | Date

// Hora de conteúdo ancorado em lugar (evento, spot) é hora de parede DE LÁ: um
// rolê às 22h em Lisboa não pode virar 18h pra quem abre o app no Brasil. Sem
// fuso, cai no do aparelho — que é o certo pra chat, notificação e "visto por
// último".
export function zonedDate(value: DateInput, timeZone?: string): Date {
  const date = typeof value === 'string' ? new Date(value) : value
  return timeZone ? new TZDate(date, timeZone) : date
}

const at = zonedDate

function render(
  value: DateInput,
  pattern: string,
  locale: string,
  timeZone?: string,
): string {
  return format(at(value, timeZone), pattern, { locale: dateFnsLocale(locale) })
}

export function formatWheelDay(date: Date, locale: string): string {
  if (isToday(date)) return i18n.t('format.relative.today', { lng: locale })
  if (isTomorrow(date))
    return i18n.t('format.relative.tomorrow', { lng: locale })
  return render(date, i18n.t('format.date.wheelDay', { lng: locale }), locale)
}

export function formatRelative(value: DateInput, locale: string): string {
  return formatDistanceToNow(at(value), {
    addSuffix: true,
    locale: dateFnsLocale(locale),
  })
}

export function formatTime(
  value: DateInput,
  locale: string,
  timeZone?: string,
): string {
  return render(
    value,
    i18n.t('format.date.time', { lng: locale }),
    locale,
    timeZone,
  )
}

export function formatShortDate(
  value: DateInput,
  locale: string,
  timeZone?: string,
): string {
  return render(
    value,
    i18n.t('format.date.shortDate', { lng: locale }),
    locale,
    timeZone,
  )
}

export function formatDateTime(
  value: DateInput,
  locale: string,
  timeZone?: string,
): string {
  return render(
    value,
    i18n.t('format.date.dateTime', { lng: locale }),
    locale,
    timeZone,
  )
}

export function formatDayMonth(
  value: DateInput,
  locale: string,
  timeZone?: string,
): string {
  return render(
    value,
    i18n.t('format.date.dayMonth', { lng: locale }),
    locale,
    timeZone,
  )
}

export function formatWeekday(
  value: DateInput,
  locale: string,
  timeZone?: string,
): string {
  return render(
    value,
    i18n.t('format.date.weekday', { lng: locale }),
    locale,
    timeZone,
  )
}

// Nome longo do mês e dia, sem ano — onde o ano é óbvio pelo contexto.
export function formatDayOfMonth(
  value: DateInput,
  locale: string,
  timeZone?: string,
): string {
  return render(
    value,
    i18n.t('format.date.dayOfMonth', { lng: locale }),
    locale,
    timeZone,
  )
}

export function formatDayOfMonthYear(
  value: DateInput,
  locale: string,
  timeZone?: string,
): string {
  return render(
    value,
    i18n.t('format.date.dayOfMonthYear', { lng: locale }),
    locale,
    timeZone,
  )
}

export function formatDayOfMonthAtTime(
  value: DateInput,
  locale: string,
  timeZone?: string,
): string {
  return render(
    value,
    i18n.t('format.date.dayOfMonthAtTime', { lng: locale }),
    locale,
    timeZone,
  )
}

// Só o número do dia. Fora do dicionário porque algarismo não muda de ordem
// entre os idiomas suportados — mas o FUSO muda o dia, daí o parâmetro.
export function formatDayNumber(
  value: DateInput,
  locale: string,
  timeZone?: string,
): string {
  return render(value, 'd', locale, timeZone)
}

// Abreviação do mês pro selo de data (chip do card de evento).
export function formatMonthShort(
  value: DateInput,
  locale: string,
  timeZone?: string,
): string {
  return render(
    value,
    i18n.t('format.date.monthShort', { lng: locale }),
    locale,
    timeZone,
  )
}

// Datas date-only (YYYY-MM-DD). Usa parse local (evita o off-by-one de fusos
// negativos, como BRT) e tolera valor ausente/inválido — a timeline de analytics
// pode vir parcial enquanto o backend está em ajuste.
export function formatDayMonthYear(isoDate: string, locale: string): string {
  if (!isoDate) return ''
  const date = parseLocalDate(isoDate)
  return Number.isNaN(date.getTime()) ? isoDate : formatShortDate(date, locale)
}

// `new Date('YYYY-MM-DD')` é interpretado como UTC; em fusos negativos vira
// o dia anterior no horário local. Use estes helpers pra campos date-only.
export function parseLocalDate(iso: string): Date {
  const [datePart] = iso.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toLocalIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
