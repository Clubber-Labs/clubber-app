import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { DatePicker } from '@/shared/components/DatePicker'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { useConfirm } from '@/shared/lib/confirm'
import { getApiError } from '@/shared/lib/apiError'
import { colors } from '@/shared/theme'
import { formatShortDate } from '@/shared/utils/dateFormat'
import { usePromoteEvent } from '../hooks/usePromoteEvent'
import { useCancelPromotion } from '../hooks/useCancelPromotion'
import { useFeaturedEvent } from '../hooks/useFeaturedEvent'
import { SponsoredBadge } from './SponsoredBadge'

// Espelha PROMOTION_MAX_DURATION_DAYS do backend: teto de duração de um destaque.
// O backend é a fonte da verdade (rejeita com mensagem se divergir); aqui é só
// pra limitar o picker e avisar o usuário.
const MAX_PROMOTION_DAYS = 7
const DAY_MS = 24 * 60 * 60 * 1000

type Props = {
  eventId: string
  eventDate: string // ISO datetime — upper bound for endsAt picker
  isPremium: boolean
  isFeatured: boolean
}

export function PromoteEventCard({
  eventId,
  eventDate,
  isPremium,
  isFeatured,
}: Props) {
  const router = useRouter()
  const confirm = useConfirm()

  const featuredEvent = useFeaturedEvent(eventId)
  const promote = usePromoteEvent(eventId)
  const cancel = useCancelPromotion(eventId)

  // Promoção é por DIA (sem hora): o usuário escolhe o primeiro e o último dia.
  const [startDay, setStartDay] = useState<Date | undefined>()
  const [endDay, setEndDay] = useState<Date | undefined>()

  // Mudar o início pra trás pode deixar um `endDay` já escolhido fora do teto
  // (o maximumDate do picker só restringe novas seleções, não revalida o atual).
  // Reclampa o fim aqui pra nunca enviar uma janela inválida.
  function handleStartDayChange(day: Date | undefined) {
    setStartDay(day)
    if (!day || !endDay) return
    const cap = day.getTime() + (MAX_PROMOTION_DAYS - 1) * DAY_MS
    if (endDay.getTime() > cap) setEndDay(new Date(cap))
  }

  function handlePromote() {
    if (!startDay || !endDay) return
    // Mapeia os dias escolhidos pra timestamps: começa no início do dia (ou
    // agora, se for hoje) e vai até o fim do último dia, sem passar da data do
    // evento. A hora exata não importa pro usuário — o backend valida o resto.
    const dayStart = new Date(startDay)
    dayStart.setHours(0, 0, 0, 0)
    const startsAt = new Date(Math.max(Date.now(), dayStart.getTime()))
    const dayEnd = new Date(endDay)
    dayEnd.setHours(23, 59, 59, 999)
    const endsAt = new Date(
      Math.min(dayEnd.getTime(), new Date(eventDate).getTime()),
    )
    if (startsAt >= endsAt) return
    // Guard de duração (belt-and-suspenders com o clamp e com o backend): nunca
    // dispara a request com janela acima do teto.
    if (endsAt.getTime() - startsAt.getTime() > MAX_PROMOTION_DAYS * DAY_MS) {
      return
    }
    promote.mutate({
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    })
  }

  async function handleCancel() {
    if (featuredEvent.kind === 'none') return
    const ok = await confirm({
      title: 'Cancelar promoção',
      message: 'Tem certeza que deseja cancelar o destaque deste evento?',
      confirmLabel: 'Cancelar promoção',
      destructive: true,
    })
    if (ok) cancel.mutate(featuredEvent.feature.id)
  }

  // Cases 2 and 3 are checked BEFORE the premium gate: DELETE /featured/:id
  // does not require premium (backend rule), so an author who downgraded from
  // premium must still see the promotion state and be able to cancel it.

  // Case 2: Active or scheduled feature in cache — show dates + cancel
  if (featuredEvent.kind !== 'none') {
    const { feature } = featuredEvent
    return (
      <View className="bg-surface-sunken border border-brand-emphasis/30 rounded-xl px-4 py-4 gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Ionicons name="star" size={18} color={colors.brandText} />
            <Text className="text-content font-semibold text-base">
              {featuredEvent.kind === 'active'
                ? 'Em promoção'
                : 'Promoção agendada'}
            </Text>
          </View>
          <SponsoredBadge />
        </View>
        <View className="gap-0.5">
          <Text className="text-content-muted text-sm">
            De{' '}
            <Text className="text-content">
              {formatShortDate(feature.startsAt)}
            </Text>
          </Text>
          <Text className="text-content-muted text-sm">
            Até{' '}
            <Text className="text-content">
              {formatShortDate(feature.endsAt)}
            </Text>
          </Text>
        </View>
        <Button
          label="Cancelar promoção"
          variant="destructive"
          onPress={handleCancel}
          loading={cancel.isPending}
        />
        {cancel.isError && (
          <FormError message={getApiError(cancel.error).message} />
        )}
      </View>
    )
  }

  // Case 3: Currently featured but featureId not in cache (promoted in another
  // session). Cannot cancel without the featureId — show read-only state.
  if (isFeatured) {
    return (
      <View className="bg-surface-sunken border border-brand-emphasis/30 rounded-xl px-4 py-4 gap-2">
        <View className="flex-row items-center gap-2">
          <Ionicons name="star" size={18} color={colors.brandText} />
          <Text className="text-content font-semibold text-base">
            Evento em promoção
          </Text>
          <SponsoredBadge />
        </View>
        <Text className="text-content-muted text-sm">
          Este evento está em destaque no momento.
        </Text>
      </View>
    )
  }

  // Case 1: Not premium and no active promotion — entry card linking to upgrade.
  // Checked after cases 2 and 3 so a downgraded author can still see/cancel
  // promotions they created while premium.
  if (!isPremium) {
    return (
      <Pressable
        onPress={() => router.push('/billing/upgrade')}
        accessibilityRole="button"
        className="flex-row items-center gap-3 bg-surface-sunken border border-line rounded-xl px-4 py-3 active:opacity-70"
      >
        <View className="w-10 h-10 rounded-full bg-brand/20 items-center justify-center">
          <Ionicons name="star-outline" size={20} color={colors.brandText} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-content font-semibold text-base">
              Promover evento
            </Text>
            <View className="px-1.5 py-0.5 rounded-md bg-brand/20 border border-brand-emphasis/40">
              <Text className="text-brand-text-strong text-xs font-bold tracking-wide">
                PREMIUM
              </Text>
            </View>
          </View>
          <Text className="text-content-muted text-sm mt-0.5">
            Destaque o evento para mais pessoas no feed e no mapa.
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.contentSubtle}
        />
      </Pressable>
    )
  }

  // Case 4: Premium, no active feature — show promotion form
  const now = new Date()
  const maxDate = new Date(eventDate)
  // Último dia selecionável no "Fim": no máximo MAX_PROMOTION_DAYS dias corridos
  // contando o dia inicial (logo, início + 6 dias) e nunca além da data do evento.
  const endMaxDate = startDay
    ? new Date(
        Math.min(
          startDay.getTime() + (MAX_PROMOTION_DAYS - 1) * DAY_MS,
          maxDate.getTime(),
        ),
      )
    : maxDate

  return (
    <View className="bg-surface-sunken border border-line rounded-xl px-4 py-4 gap-4">
      <View className="gap-1">
        <View className="flex-row items-center gap-2">
          <Ionicons name="star-outline" size={18} color={colors.brandText} />
          <Text className="text-content font-semibold text-base">
            Promover evento
          </Text>
        </View>
        <Text className="text-content-muted text-sm">
          Destaque o evento para mais pessoas no feed e no mapa.
        </Text>
      </View>

      <View className="gap-1">
        <Text className="text-sm font-medium text-content-tertiary">
          Primeiro dia
        </Text>
        <DatePicker
          value={startDay}
          onChange={handleStartDayChange}
          placeholder="Selecione o dia"
          minimumDate={now}
          maximumDate={maxDate}
          mode="date"
        />
      </View>

      <View className="gap-1">
        <Text className="text-sm font-medium text-content-tertiary">
          Último dia
        </Text>
        <DatePicker
          value={endDay}
          onChange={setEndDay}
          placeholder="Selecione o dia"
          minimumDate={startDay ?? now}
          maximumDate={endMaxDate}
          mode="date"
        />
        <Text className="text-content-subtle text-xs">
          Promoção por dia — máximo de {MAX_PROMOTION_DAYS} dias por destaque.
        </Text>
      </View>

      {promote.isError && (
        <FormError message={getApiError(promote.error).message} />
      )}

      <Button
        label="Promover evento"
        onPress={handlePromote}
        loading={promote.isPending}
        disabled={!startDay || !endDay || endDay < startDay}
      />
    </View>
  )
}
