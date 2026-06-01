import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { UserAvatar } from '@/shared/components/UserAvatar'
import type { UserMini } from '@/shared/types'

type Props = {
  users: UserMini[]
  type: 'DIRECT' | 'GROUP'
  size?: number
}

// DM → avatar do outro participante. Grupo → stack de até 2 avatares (ou ícone
// de grupo quando não há membros conhecidos).
export function ConversationAvatar({ users, type, size = 52 }: Props) {
  if (type === 'GROUP') {
    if (users.length === 0) {
      return (
        <View
          style={{ width: size, height: size, borderRadius: size / 2 }}
          className="bg-zinc-800 items-center justify-center"
        >
          <Ionicons name="people" size={Math.round(size * 0.5)} color="#a1a1aa" />
        </View>
      )
    }
    const small = Math.round(size * 0.64)
    const shown = users.slice(0, 2)
    return (
      <View style={{ width: size, height: size }}>
        {shown.map((user, i) => (
          <View
            key={user.id}
            style={{
              position: 'absolute',
              ...(i === 0 ? { top: 0, left: 0 } : { bottom: 0, right: 0 }),
            }}
            className="border-2 border-black rounded-full overflow-hidden"
          >
            <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size={small} />
          </View>
        ))}
      </View>
    )
  }

  const user = users[0]
  if (!user) {
    return (
      <View
        style={{ width: size, height: size, borderRadius: size / 2 }}
        className="bg-zinc-800"
      />
    )
  }
  return <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size={size} />
}
