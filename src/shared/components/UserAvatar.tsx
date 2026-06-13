import { View, Text, Image } from 'react-native'

type Props = {
  name: string
  avatarUrl?: string | null
  size?: number
}

export function UserAvatar({ name, avatarUrl, size = 36 }: Props) {
  const initial = name.trim()[0]?.toUpperCase() ?? '?'
  const borderRadius = size / 2
  const fontSize = Math.round(size * 0.4)

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: size, height: size, borderRadius }}
        resizeMode="cover"
      />
    )
  }

  return (
    <View
      style={{ width: size, height: size, borderRadius }}
      className="bg-brand-surface-strong items-center justify-center"
    >
      <Text
        style={{ fontSize }}
        className="text-brand-text-strong font-semibold"
      >
        {initial}
      </Text>
    </View>
  )
}
