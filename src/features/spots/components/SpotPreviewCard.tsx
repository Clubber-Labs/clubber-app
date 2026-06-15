import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { useCategories } from '@/shared/hooks/useCategories'
import { formatSpotWindow } from '../utils/spotWindow'
import { distanceKm, formatDistance } from '@/shared/utils/distance'
import type { Spot } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  spot: Spot
  // Coords do usuário [lng, lat] pra calcular a distância; null se indisponível.
  userCoords: [number, number] | null
  onClose: () => void
  onSeeDetails: () => void
}

// Espelha o EventPreviewCard. Rolês não têm capa, então o thumb é o gradiente da
// marca com o ícone de sparkles; assinatura do criador, janela · distância e grupo.
export function SpotPreviewCard({
  spot,
  userCoords,
  onClose,
  onSeeDetails,
}: Props) {
  const { labelFor } = useCategories()
  const categoriesText = spot.categories.map(labelFor).join(', ')
  const memberLabel =
    spot.memberCount === 1 ? '1 no grupo' : `${spot.memberCount} no grupo`
  const distance = userCoords
    ? formatDistance(distanceKm(userCoords, [spot.longitude, spot.latitude]))
    : null
  const windowText = [formatSpotWindow(spot.startsAt, spot.endsAt), distance]
    .filter(Boolean)
    .join(' · ')

  return (
    <View className="absolute bottom-4 left-3 right-3 rounded-xl border border-line-strong bg-surface p-3">
      <Pressable
        onPress={onClose}
        accessibilityLabel="Fechar"
        hitSlop={8}
        className="absolute right-2.5 top-2.5 z-10 h-7 w-7 items-center justify-center rounded-lg bg-surface-elevated"
      >
        <Ionicons name="close" size={16} color={colors.contentMuted} />
      </Pressable>

      <View className="flex-row gap-3">
        <View
          className="h-20 w-20 items-center justify-center overflow-hidden rounded-lg"
          style={{ backgroundColor: colors.brandSurfaceStrong }}
        >
          <Ionicons name="sparkles" size={26} color={colors.brandTextBright} />
        </View>

        <View className="flex-1 gap-1 pr-6">
          <View className="flex-row items-center gap-2">
            <UserAvatar
              name={spot.creator.name}
              avatarUrl={spot.creator.avatarUrl}
              size={20}
            />
            <Text
              className="flex-1 text-xs text-content-muted"
              numberOfLines={1}
            >
              @{spot.creator.username} sugeriu um rolê
            </Text>
          </View>
          <Text
            className="text-base font-extrabold text-content"
            numberOfLines={1}
          >
            {spot.title}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <Ionicons
              name="time-outline"
              size={13}
              color={colors.contentSubtle}
            />
            <Text
              className="flex-1 text-xs text-content-muted"
              numberOfLines={1}
            >
              {windowText}
            </Text>
          </View>
          <Text className="text-xs text-content-subtle" numberOfLines={1}>
            {categoriesText} · {memberLabel}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onSeeDetails}
        className="mt-3 h-11 flex-row items-center justify-center gap-1.5 rounded-lg bg-brand"
      >
        <Text className="text-sm font-bold text-content">Ver rolê</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.content} />
      </Pressable>
    </View>
  )
}
