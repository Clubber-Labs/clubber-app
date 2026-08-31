import { View, Text, Pressable } from 'react-native'
import { CheckCircleIcon, TicketIcon, XCircleIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { useSetAttendance, useCancelAttendance } from '../hooks/useAttendance'
import { EventStatusBadge } from './EventStatusBadge'
import { useLocale } from '@/shared/hooks/useLocale'
import {
  formatDayNumber,
  formatMonthShort,
  formatTime,
  formatWeekday,
} from '@/shared/utils/dateFormat'
import type { FeedEvent } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  event: FeedEvent
}

const TIME_BASELINE_NUDGE = 9

/**
 * O canhoto: quando é, e se você vai. É a metade destacável do ingresso, então
 * carrega só a decisão — o que o evento É já foi dito pelo pôster acima.
 *
 * Estados por PESO, sem cor semântica, mesma língua do RSVP do detalhe
 * (EventRsvpRow): pendente = branco cheio; respondido = quieto (outline claro
 * no confirmado, fantasma no "não vou").
 */
export function EventCardStub({ event }: Props) {
  const { t } = useTranslation()
  const locale = useLocale()
  const setAttendance = useSetAttendance(event.id)
  const cancelAttendance = useCancelAttendance(event.id)

  const timezone = event.timezone ?? undefined
  // Abreviações vêm com ponto em vários idiomas ("sáb.", "set.") — em caixa
  // alta o ponto vira sujeira.
  const strip = (value: string) => value.replace(/\./g, '')
  const weekday = strip(formatWeekday(event.date, locale, timezone))
  const month = strip(formatMonthShort(event.date, locale, timezone))

  const going = event.userAttendance === 'CONFIRMED'
  const declined = event.userAttendance === 'NOT_INTERESTED'
  const pending = setAttendance.isPending || cancelAttendance.isPending
  // Evento encerrado ou cancelado não recebe RSVP — mesma janela do detalhe.
  const closed = event.status === 'PAST' || event.status === 'CANCELED'

  function toggle(type: 'CONFIRMED' | 'NOT_INTERESTED') {
    if (event.userAttendance === type) cancelAttendance.mutate()
    else setAttendance.mutate(type)
  }

  return (
    <View className="flex-row items-center justify-between gap-3 px-4 py-3">
      {/* Uma coluna por par: o rótulo manda na largura e o valor pousa sob ele
          — dia da semana sobre o dia, mês sobre a hora. */}
      <View className="flex-row">
        <View className="flex-col items-center gap-1">
          <Text className="text-[10px] font-bold uppercase tracking-[2px] text-content-muted">
            {weekday}
          </Text>
          <Text className="text-[30px] font-extrabold leading-none text-content">
            {formatDayNumber(event.date, locale, timezone)}
          </Text>
        </View>
        {/* O · fica ENTRE as colunas, não colado num rótulo: dentro de um deles
            ele entraria na conta da centralização e tortaria o par. */}
        <Text className="relative left-1.5 self-start text-[14px] leading-none font-black text-content-muted">
          ·
        </Text>
        <View className="flex-col items-center">
          <Text className="text-[10px] font-bold uppercase tracking-[2px] text-content-muted">
            {month}
          </Text>
          <Text
            className="text-[18px] font-extrabold leading-none text-content-secondary"
            // Em colunas separadas não há mais irmão pra alinhar por baseline:
            // a hora desce ~0.72em da diferença de corpo (30 e 18) pra pousar
            // na mesma linha-base do número do dia.
            style={{ marginTop: TIME_BASELINE_NUDGE }}
          >
            {formatTime(event.date, locale, timezone)}
          </Text>
        </View>
      </View>

      {closed ? (
        <EventStatusBadge status={event.status} date={event.date} />
      ) : going ? (
        <Pressable
          onPress={() => toggle('CONFIRMED')}
          disabled={pending}
          accessibilityRole="button"
          accessibilityState={{ selected: true, busy: pending }}
          className="flex-row items-center gap-2 rounded-full border border-white/40 px-4 py-2.5"
        >
          <CheckCircleIcon size={16} color={colors.content} weight="fill" />
          <Text className="text-sm font-bold text-content">
            {t('events.rsvp.confirmed')}
          </Text>
        </Pressable>
      ) : (
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => toggle('CONFIRMED')}
            disabled={pending}
            accessibilityRole="button"
            accessibilityState={{ selected: false, busy: pending }}
            className={`flex-row items-center gap-1.5 rounded-full px-4 py-2.5 ${
              declined ? 'border border-line-strong' : 'bg-content'
            }`}
          >
            {!declined && (
              <TicketIcon size={16} color={colors.background} weight="fill" />
            )}
            <Text
              className={`text-sm font-bold ${declined ? 'text-content-muted' : 'text-background'}`}
            >
              {t('events.rsvp.going')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => toggle('NOT_INTERESTED')}
            disabled={pending}
            accessibilityRole="button"
            accessibilityState={{ selected: declined, busy: pending }}
            className="flex-row items-center gap-1.5 rounded-full border border-line-strong px-4 py-2.5"
          >
            {declined && (
              <XCircleIcon
                size={16}
                color={colors.contentSubtle}
                weight="fill"
              />
            )}
            <Text
              className={`text-sm font-bold ${declined ? 'text-content-subtle' : 'text-content-muted'}`}
            >
              {t('events.rsvp.notGoing')}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
