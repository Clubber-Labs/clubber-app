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
      className="flex-1 items-center py-1"
    >
      <Text className="text-content text-lg font-extrabold">{value}</Text>
      <Text className="text-content-muted mt-0.5 text-xs">{label}</Text>
    </Pressable>
  )
}

// Stats inline, ao lado do avatar (sem divisórias/borda) — densidade de perfil
// moderno; o header fica curto e a grade de eventos sobe.
export function ProfileStats({
  eventsCount,
  followersCount,
  followingCount,
  onFollowersPress,
  onFollowingPress,
}: Props) {
  return (
    <View className="flex-1 flex-row">
      <StatItem value={eventsCount} label="Eventos" />
      <StatItem
        value={followersCount}
        label="Seguidores"
        onPress={onFollowersPress}
      />
      <StatItem
        value={followingCount}
        label="Seguindo"
        onPress={onFollowingPress}
      />
    </View>
  )
}
