import { useState } from 'react'
import { View, Text, StyleSheet, type LayoutChangeEvent } from 'react-native'
import { MapPinIcon } from 'phosphor-react-native'
import Svg, { Line, Path } from 'react-native-svg'
import { useTranslation } from 'react-i18next'
import { AddressLink } from '@/shared/components/AddressLink'
import { useLocale } from '@/shared/hooks/useLocale'
import {
  formatDayNumber,
  formatMonthShort,
  formatTime,
} from '@/shared/utils/dateFormat'
import type { EventDetail } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  event: EventDetail
}

const CARD_RADIUS = 16
const NOTCH_RADIUS = 9
// Onde o picote cai — a mesma largura da coluna da data (w-24).
const DIVIDER_X = 96
// Traço de 1px: o stroke do SVG é centrado no caminho, então meio pixel fica
// pra fora se o caminho correr na borda exata do viewport.
const STROKE_INSET = 0.5

/**
 * Silhueta do ingresso num traçado só — preenchimento, borda e os dois recortes
 * do picote como arcos DO PRÓPRIO contorno (varredura 0 = a curva entra pra
 * dentro do card). Desenhar a borda e o furo separados — View com borda +
 * bolinha por cima — dependia do overflow-hidden cortar a bolinha na metade
 * certa; quando não corta, a linha some no vão e o recorte não tem arco.
 */
function ticketOutline(width: number, height: number): string {
  const left = STROKE_INSET
  const top = STROKE_INSET
  const right = width - STROKE_INSET
  const bottom = height - STROKE_INSET
  const r = CARD_RADIUS
  const n = NOTCH_RADIUS
  const x = DIVIDER_X
  return [
    `M ${left + r} ${top}`,
    `L ${x - n} ${top}`,
    `A ${n} ${n} 0 0 0 ${x + n} ${top}`,
    `L ${right - r} ${top}`,
    `A ${r} ${r} 0 0 1 ${right} ${top + r}`,
    `L ${right} ${bottom - r}`,
    `A ${r} ${r} 0 0 1 ${right - r} ${bottom}`,
    `L ${x + n} ${bottom}`,
    `A ${n} ${n} 0 0 0 ${x - n} ${bottom}`,
    `L ${left + r} ${bottom}`,
    `A ${r} ${r} 0 0 1 ${left} ${bottom - r}`,
    `L ${left} ${top + r}`,
    `A ${r} ${r} 0 0 1 ${left + r} ${top}`,
    'Z',
  ].join(' ')
}

export function EventTicketCard({ event }: Props) {
  const { t } = useTranslation()
  const locale = useLocale()
  // O contorno precisa da medida real: a altura depende do endereço (uma ou
  // duas linhas). Antes do 1º layout sai só o retângulo do bg, sem recorte.
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  )
  const timezone = event.timezone ?? undefined
  const place = event.venueName ?? event.address
  // Sem estabelecimento, o endereço já é o título — repeti-lo abaixo seria eco.
  const secondary = event.venueName ? event.address : undefined

  function handleLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout
    setSize(current =>
      current?.width === width && current?.height === height
        ? current
        : { width, height },
    )
  }

  return (
    <View
      // O fundo é do PATH, não da View: o canvas do SVG usa o float do
      // onLayout e a View é encaixada na grade de pixels, então sobrava até 1px
      // de View sem SVG em cima — e esse resto de `surface` cruzava o recorte
      // do picote como um fiapo. Um pintor só resolve, e de quebra o furo vira
      // buraco de verdade (transparente) em vez de uma bolinha pintada com a
      // cor do fundo. Antes da 1ª medida não há path: aí a View segura o fundo
      // pra o card não piscar vazio.
      className={size ? 'rounded-2xl' : 'rounded-2xl bg-surface'}
      onLayout={handleLayout}
    >
      {!!size && (
        <Svg
          width={size.width}
          height={size.height}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Path
            d={ticketOutline(size.width, size.height)}
            fill={colors.surface}
            stroke={colors.line}
            strokeWidth={1}
          />
          <Line
            x1={DIVIDER_X}
            y1={NOTCH_RADIUS + 4}
            x2={DIVIDER_X}
            y2={size.height - NOTCH_RADIUS - 4}
            stroke={colors.lineStrong}
            strokeWidth={1}
            strokeDasharray={[4, 5]}
          />
        </Svg>
      )}

      <View className="flex-row">
        <View className="w-24 items-center justify-center py-4">
          <Text className="text-content-muted text-xs font-bold uppercase tracking-[3px]">
            {formatMonthShort(event.date, locale, timezone).replace(/\./g, '')}
          </Text>
          <Text className="text-content my-1 text-[32px] font-extrabold leading-none">
            {formatDayNumber(event.date, locale, timezone)}
          </Text>
          <Text className="text-content-muted text-sm font-semibold">
            {formatTime(event.date, locale, timezone)}
          </Text>
        </View>

        <AddressLink
          address={event.address}
          latitude={event.latitude}
          longitude={event.longitude}
          // A folga da esquerda se mede do FURO (que entra 9px), não do
          // picote: com px-4 o texto passava a 7px do recorte e encostava.
          className="flex-1 justify-center gap-1 pl-10 pr-4 py-4"
        >
          <Text className="text-content text-lg font-bold" numberOfLines={1}>
            {place ?? t('events.header.viewLocationOnMap')}
          </Text>
          {!!secondary && (
            <Text className="text-content-muted text-sm" numberOfLines={2}>
              {secondary}
            </Text>
          )}
          <View className="flex-row items-center gap-1 pt-1">
            <MapPinIcon
              size={14}
              weight="fill"
              color={colors.contentSecondary}
            />
            <Text className="text-content-secondary text-sm font-semibold">
              {t('events.header.openInMap')}
            </Text>
          </View>
        </AddressLink>
      </View>
    </View>
  )
}
