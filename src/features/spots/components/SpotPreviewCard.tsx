import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { useCategories } from '@/shared/hooks/useCategories'
import { formatSpotWindow } from '../utils/spotWindow'
import type { Spot } from '../types'

type Props = {
  spot: Spot
  onClose: () => void
  onSeeDetails: () => void
}

// Card de preview ao tocar num balão — espelha o EventPreviewCard do mapa.
export function SpotPreviewCard({ spot, onClose, onSeeDetails }: Props) {
  const { labelFor } = useCategories()
  const categoriesText = spot.categories.map(labelFor).join(', ')
  const memberLabel =
    spot.memberCount === 1 ? '1 pessoa' : `${spot.memberCount} pessoas`

  return (
    <View className="absolute bottom-4 left-4 right-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 gap-3">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 gap-1.5">
          <View className="flex-row items-center gap-2">
            <UserAvatar
              name={`${spot.creator.name} ${spot.creator.lastname}`}
              avatarUrl={spot.creator.avatarUrl}
              size={28}
            />
            <Text className="text-zinc-400 text-xs flex-1" numberOfLines={1}>
              @{spot.creator.username} sugeriu um rolê
            </Text>
          </View>
          <Text className="text-white text-lg font-bold" numberOfLines={2}>
            {spot.title}
          </Text>
          <Text className="text-zinc-400 text-xs">
            {formatSpotWindow(spot.startsAt, spot.endsAt)}
          </Text>
          <Text className="text-zinc-500 text-xs" numberOfLines={1}>
            {categoriesText} · {memberLabel} no grupo
          </Text>
        </View>
        <Pressable
          onPress={onClose}
          className="w-7 h-7 items-center justify-center"
        >
          <Ionicons name="close" size={20} color="#a1a1aa" />
        </Pressable>
      </View>

      <Pressable
        onPress={onSeeDetails}
        className="bg-violet-600 rounded-xl py-3 items-center"
      >
        <Text className="text-sm font-semibold text-white">Ver spot</Text>
      </Pressable>
    </View>
  )
}
