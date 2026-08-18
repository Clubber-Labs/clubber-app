import { i18n } from '@/shared/i18n'

/**
 * Formata um valor em centavos (como o Stripe envia) para moeda local.
 * Ex: formatPrice(1990, 'brl', 'pt') → "R$ 19,90".
 *
 * A moeda é do preço, o locale é de quem lê: um brasileiro com o app em inglês
 * vê "R$19.90", não dólar. Cai num formato manual se o runtime (Hermes sem ICU
 * completo) não suportar a currency, pra nunca lançar.
 */
export function formatPrice(
  amountInCents: number,
  currency = 'BRL',
  locale = 'pt',
): string {
  const value = amountInCents / 100
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(value)
  } catch {
    return `${currency.toUpperCase()} ${value.toFixed(2)}`
  }
}

/** "month" → "mês", "year" → "ano". Fallback: devolve o próprio termo. */
export function formatInterval(interval: string, locale: string): string {
  if (interval === 'month')
    return i18n.t('format.interval.month', { lng: locale })
  if (interval === 'year')
    return i18n.t('format.interval.year', { lng: locale })
  return interval
}
