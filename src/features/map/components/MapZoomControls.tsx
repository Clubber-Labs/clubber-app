import { View, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/shared/theme'

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
        className={`w-16 h-16 rounded-full items-center justify-center border ${densityActive ? 'bg-danger-strong border-danger' : 'bg-surface border-line'}`}
      >
        <Ionicons
          name="flame"
          size={28}
          color={densityActive ? colors.content : colors.dangerStrong}
        />
      </Pressable>
      <Pressable
        onPress={onZoomIn}
        className="w-16 h-16 rounded-full bg-surface border border-line items-center justify-center"
      >
        <Ionicons name="add" size={28} color={colors.contentBright} />
      </Pressable>
      <Pressable
        onPress={onZoomOut}
        className="w-16 h-16 rounded-full bg-surface border border-line items-center justify-center"
      >
        <Ionicons name="remove" size={28} color={colors.contentBright} />
      </Pressable>
      {showRecenter && (
        <Pressable
          onPress={onRecenter}
          className="w-16 h-16 rounded-full bg-surface border border-line items-center justify-center"
        >
          <Ionicons name="locate" size={28} color={colors.brandEmphasis} />
        </Pressable>
      )}
    </View>
  )
}
