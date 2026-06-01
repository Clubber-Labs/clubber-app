import { ScrollView, Pressable, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { UserMini } from '@/shared/types'

type Props = {
  users: UserMini[]
  onRemove: (id: string) => void
}

export function SelectedUserChips({ users, onRemove }: Props) {
  if (users.length === 0) return null
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
      className="py-2 border-b border-zinc-900"
    >
      {users.map(user => (
        <Pressable
          key={user.id}
          onPress={() => onRemove(user.id)}
          className="flex-row items-center gap-1.5 bg-violet-950 rounded-full pl-3 pr-2 py-1.5"
          accessibilityLabel={`Remover ${user.name}`}
        >
          <Text className="text-violet-200 text-sm">{user.name}</Text>
          <Ionicons name="close-circle" size={16} color="#a78bfa" />
        </Pressable>
      ))}
    </ScrollView>
  )
}
