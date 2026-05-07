import { View, Text, Pressable } from 'react-native'

type Props = {
  eventsCount: number
  followersCount: number
  followingCount: number
  onFollowersPress?: () => void
  onFollowingPress?: () => void
}

function StatItem({
  value,
  label,
  onPress,
}: {
  value: number
  label: string
  onPress?: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="items-center flex-1"
    >
      <Text className="text-white font-bold text-lg">{value}</Text>
      <Text className="text-zinc-400 text-xs mt-0.5">{label}</Text>
    </Pressable>
  )
}

export function ProfileStats({
  eventsCount,
  followersCount,
  followingCount,
  onFollowersPress,
  onFollowingPress,
}: Props) {
  return (
    <View className="flex-row py-4 border-b border-zinc-900">
      <StatItem value={eventsCount} label="Eventos" />
      <View className="w-px bg-zinc-800" />
      <StatItem
        value={followersCount}
        label="Seguidores"
        onPress={onFollowersPress}
      />
      <View className="w-px bg-zinc-800" />
      <StatItem
        value={followingCount}
        label="Seguindo"
        onPress={onFollowingPress}
      />
    </View>
  )
}
