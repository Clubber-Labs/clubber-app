import { Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { colors } from '@/shared/theme'

export function FloatingCreateButton() {
  const router = useRouter()

  return (
    <Pressable
      onPress={() => router.push('/events/create')}
      className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-brand items-center justify-center shadow-lg"
      style={{
        shadowColor: colors.background,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <Ionicons name="add" size={28} color={colors.content} />
    </Pressable>
  )
}
