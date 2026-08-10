import { View, Pressable } from 'react-native'
import {
  FireIcon,
  PlusIcon,
  MinusIcon,
  GpsFixIcon,
} from 'phosphor-react-native'
import { GlassSurface } from '@/shared/components/GlassSurface'
import { colors } from '@/shared/theme'
import { useTabBarClearance } from '@/shared/hooks/useTabBarClearance'

type Props = {
  onZoomIn: () => void
  onZoomOut: () => void
  onRecenter?: () => void
  showRecenter?: boolean
  densityActive: boolean
  onToggleDensity: () => void
}

// Divisores entre os botões no mesmo hairline da borda do vidro.
const GLASS_DIVIDER = { borderTopColor: 'rgba(255, 255, 255, 0.13)' }

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
  const tabBarClearance = useTabBarClearance()

  return (
    <View
      className="absolute right-4"
      // Acima do FAB de criar (56) + o mesmo respiro visual do layout antigo;
      // sombra idêntica à da tab bar (mesmo sistema de vidro flutuante).
      style={{
        bottom: tabBarClearance + 88,
        shadowColor: 'rgb(0, 0, 0)',
        shadowOpacity: 0.7,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
      }}
    >
      <GlassSurface style={{ width: 56, borderRadius: 12 }}>
        <Pressable
          onPress={onToggleDensity}
          accessibilityRole="button"
          accessibilityState={{ selected: densityActive }}
          accessibilityLabel={
            densityActive ? 'Ocultar mapa de calor' : 'Mostrar mapa de calor'
          }
          className={`h-14 items-center justify-center ${densityActive ? 'bg-brand' : ''}`}
        >
          <FireIcon
            size={24}
            color={densityActive ? colors.content : colors.contentBright}
            weight={densityActive ? 'fill' : 'regular'}
          />
        </Pressable>
        <Pressable
          onPress={onZoomIn}
          accessibilityLabel="Aproximar"
          className="h-14 items-center justify-center border-t"
          style={GLASS_DIVIDER}
        >
          <PlusIcon size={26} color={colors.contentBright} />
        </Pressable>
        <Pressable
          onPress={onZoomOut}
          accessibilityLabel="Afastar"
          className="h-14 items-center justify-center border-t"
          style={GLASS_DIVIDER}
        >
          <MinusIcon size={26} color={colors.contentBright} />
        </Pressable>
        {showRecenter && (
          <Pressable
            onPress={onRecenter}
            accessibilityLabel="Centralizar em você"
            className="h-14 items-center justify-center border-t"
            style={GLASS_DIVIDER}
          >
            <GpsFixIcon size={24} color={colors.brandText} />
          </Pressable>
        )}
      </GlassSurface>
    </View>
  )
}
