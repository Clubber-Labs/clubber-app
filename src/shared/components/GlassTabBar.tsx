import { useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSegments } from 'expo-router'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { GlassSurface } from '@/shared/components/GlassSurface'
import { isProfileTab } from '@/shared/utils/tabRoutes'
import { colors } from '@/shared/theme'

export const TAB_BAR_HEIGHT = 64
// No Perfil a pílula encolhe: a vitrine de eventos espia por baixo do mural e
// a barra cheia engolia a primeira fileira.
export const TAB_BAR_COMPACT_HEIGHT = 50
export const TAB_BAR_BOTTOM_MARGIN = 8
export const TAB_BAR_SIDE_MARGIN = 24
// Compacta também na largura: as cinco lentes menores cabem numa pílula mais
// curta, e ela deixa de parecer uma barra.
const COMPACT_SIDE_MARGIN = 72

const LENS_SIZE = 44
const COMPACT_LENS_SCALE = 36 / LENS_SIZE
const COMPACT_MS = 220

// Pílula flutuante "liquid glass": blur translúcido, borda hairline e lente
// circular no item ativo. Posicionada em absoluto — as cenas ocupam a tela
// inteira e o conteúdo passa por baixo do vidro; âncoras/paddings inferiores
// das telas compensam via useTabBarClearance.
export function GlassTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const segments = useSegments() as string[]
  const compact = isProfileTab(segments)

  // Um valor só dirige largura, altura e lente: trocar de aba anima entre os dois
  // tamanhos em vez de saltar. A lente encolhe por transform (sem re-layout);
  // a altura é a única propriedade de layout, numa view só.
  const progress = useSharedValue(compact ? 1 : 0)
  useEffect(() => {
    progress.value = withTiming(compact ? 1 : 0, { duration: COMPACT_MS })
  }, [compact, progress])

  const frameStyle = useAnimatedStyle(() => {
    const side = interpolate(
      progress.value,
      [0, 1],
      [TAB_BAR_SIDE_MARGIN, COMPACT_SIDE_MARGIN],
    )
    return { left: side, right: side }
  })
  const barStyle = useAnimatedStyle(() => {
    const height = interpolate(
      progress.value,
      [0, 1],
      [TAB_BAR_HEIGHT, TAB_BAR_COMPACT_HEIGHT],
    )
    return { height, borderRadius: height / 2 }
  })
  const lensStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(progress.value, [0, 1], [1, COMPACT_LENS_SCALE]) },
    ],
  }))

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: 'absolute',
          bottom: insets.bottom + TAB_BAR_BOTTOM_MARGIN,
          shadowColor: 'rgb(0, 0, 0)',
          shadowOpacity: 0.7,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
        },
        frameStyle,
      ]}
    >
      <Animated.View style={[{ overflow: 'hidden' }, barStyle]}>
        <GlassSurface
          style={{
            flex: 1,
            borderRadius: TAB_BAR_HEIGHT / 2,
            flexDirection: 'row',
          }}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key]
            const focused = state.index === index

            function onPress() {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              })
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params)
              }
            }

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={options.title}
                className="flex-1 items-center justify-center"
              >
                <Animated.View
                  className="items-center justify-center"
                  style={[{ width: LENS_SIZE, height: LENS_SIZE }, lensStyle]}
                >
                  {focused && (
                    <View
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.16)' }}
                    />
                  )}
                  {options.tabBarIcon?.({
                    focused,
                    color: focused
                      ? colors.content
                      : 'rgba(255, 255, 255, 0.55)',
                    size: 28,
                  })}
                  {options.tabBarBadge != null && (
                    <View className="absolute right-0.5 top-1.5 h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1">
                      <Text className="text-[10px] font-bold text-content">
                        {options.tabBarBadge}
                      </Text>
                    </View>
                  )}
                </Animated.View>
              </Pressable>
            )
          })}
        </GlassSurface>
      </Animated.View>
    </Animated.View>
  )
}
