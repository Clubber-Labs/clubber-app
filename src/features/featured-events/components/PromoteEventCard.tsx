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
import { formatDateTime } from '@/shared/utils/dateFormat'
import { usePromoteEvent } from '../hooks/usePromoteEvent'
import { useCancelPromotion } from '../hooks/useCancelPromotion'
import { useFeaturedEvent } from '../hooks/useFeaturedEvent'
import { SponsoredBadge } from './SponsoredBadge'

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

  const [startsAt, setStartsAt] = useState<Date | undefined>()
  const [endsAt, setEndsAt] = useState<Date | undefined>()

  function handlePromote() {
    if (!startsAt || !endsAt) return
    if (startsAt >= endsAt) return
    promote.mutate({ startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() })
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
              {featuredEvent.kind === 'active' ? 'Em promoção' : 'Promoção agendada'}
            </Text>
          </View>
          <SponsoredBadge />
        </View>
        <View className="gap-0.5">
          <Text className="text-content-muted text-sm">
            De{' '}
            <Text className="text-content">{formatDateTime(feature.startsAt)}</Text>
          </Text>
          <Text className="text-content-muted text-sm">
            Até{' '}
            <Text className="text-content">{formatDateTime(feature.endsAt)}</Text>
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
        <Ionicons name="chevron-forward" size={18} color={colors.contentSubtle} />
      </Pressable>
    )
  }

  // Case 4: Premium, no active feature — show promotion form
  const now = new Date()
  const maxDate = new Date(eventDate)

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
          Início da promoção
        </Text>
        <DatePicker
          value={startsAt}
          onChange={setStartsAt}
          placeholder="Selecione data e hora"
          minimumDate={now}
          maximumDate={maxDate}
          mode="datetime"
        />
      </View>

      <View className="gap-1">
        <Text className="text-sm font-medium text-content-tertiary">
          Fim da promoção
        </Text>
        <DatePicker
          value={endsAt}
          onChange={setEndsAt}
          placeholder="Selecione data e hora"
          minimumDate={startsAt ?? now}
          maximumDate={maxDate}
          mode="datetime"
        />
      </View>

      {promote.isError && (
        <FormError message={getApiError(promote.error).message} />
      )}

      <Button
        label="Promover evento"
        onPress={handlePromote}
        loading={promote.isPending}
        disabled={!startsAt || !endsAt || startsAt >= endsAt}
      />
    </View>
  )
}
