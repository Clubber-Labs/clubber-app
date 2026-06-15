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

// Controles do mapa numa pílula única (mapa de calor · zoom · locate) em vez de
// círculos soltos. Botões de 56px (alinham com o FAB de criar). O calor ativo usa
// a cor da marca — é um modo de visualização, não um alerta.
export function MapZoomControls({
  onZoomIn,
  onZoomOut,
  onRecenter,
  showRecenter,
  densityActive,
  onToggleDensity,
}: Props) {
  return (
    <View className="absolute bottom-28 right-4 w-14 overflow-hidden rounded-xl border border-line-strong bg-surface/95">
      <Pressable
        onPress={onToggleDensity}
        accessibilityRole="button"
        accessibilityState={{ selected: densityActive }}
        accessibilityLabel={
          densityActive ? 'Ocultar mapa de calor' : 'Mostrar mapa de calor'
        }
        className={`h-14 items-center justify-center ${densityActive ? 'bg-brand' : ''}`}
      >
        <Ionicons
          name="flame"
          size={24}
          color={densityActive ? colors.content : colors.contentBright}
        />
      </Pressable>
      <Pressable
        onPress={onZoomIn}
        accessibilityLabel="Aproximar"
        className="h-14 items-center justify-center border-t border-line"
      >
        <Ionicons name="add" size={26} color={colors.contentBright} />
      </Pressable>
      <Pressable
        onPress={onZoomOut}
        accessibilityLabel="Afastar"
        className="h-14 items-center justify-center border-t border-line"
      >
        <Ionicons name="remove" size={26} color={colors.contentBright} />
      </Pressable>
      {showRecenter && (
        <Pressable
          onPress={onRecenter}
          accessibilityLabel="Centralizar em você"
          className="h-14 items-center justify-center border-t border-line"
        >
          <Ionicons name="locate" size={24} color={colors.brandText} />
        </Pressable>
      )}
    </View>
  )
}
