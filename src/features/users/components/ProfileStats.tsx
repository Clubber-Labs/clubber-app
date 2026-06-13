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
      <Text className="text-content font-bold text-lg">{value}</Text>
      <Text className="text-content-muted text-xs mt-0.5">{label}</Text>
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
    <View className="flex-row py-4 border-b border-line-subtle">
      <StatItem value={eventsCount} label="Eventos" />
      <View className="w-px bg-surface-elevated" />
      <StatItem
        value={followersCount}
        label="Seguidores"
        onPress={onFollowersPress}
      />
      <View className="w-px bg-surface-elevated" />
      <StatItem
        value={followingCount}
        label="Seguindo"
        onPress={onFollowingPress}
      />
    </View>
  )
}
