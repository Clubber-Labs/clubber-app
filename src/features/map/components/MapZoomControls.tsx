import { View, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  onZoomIn: () => void
  onZoomOut: () => void
  onRecenter?: () => void
  showRecenter?: boolean
  densityActive: boolean
  onToggleDensity: () => void
}

export function MapZoomControls({
  onZoomIn,
  onZoomOut,
  onRecenter,
  showRecenter,
  densityActive,
  onToggleDensity,
}: Props) {
  return (
    <View className="absolute bottom-32 right-4 gap-2">
      <Pressable
        onPress={onToggleDensity}
        accessibilityLabel={
          densityActive ? 'Ocultar densidade' : 'Mostrar densidade'
        }
        className={`w-16 h-16 rounded-full items-center justify-center border ${densityActive ? 'bg-red-600 border-red-500' : 'bg-zinc-900 border-zinc-800'}`}
      >
        <Ionicons
          name="flame"
          size={28}
          color={densityActive ? '#ffffff' : '#dc2626'}
        />
      </Pressable>
      <Pressable
        onPress={onZoomIn}
        className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center"
      >
        <Ionicons name="add" size={28} color="#f4f4f5" />
      </Pressable>
      <Pressable
        onPress={onZoomOut}
        className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center"
      >
        <Ionicons name="remove" size={28} color="#f4f4f5" />
      </Pressable>
      {showRecenter && (
        <Pressable
          onPress={onRecenter}
          className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center"
        >
          <Ionicons name="locate" size={28} color="#8b5cf6" />
        </Pressable>
      )}
    </View>
  )
}
