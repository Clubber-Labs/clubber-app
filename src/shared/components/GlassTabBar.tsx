import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { GlassSurface } from '@/shared/components/GlassSurface'
import { colors } from '@/shared/theme'

export const TAB_BAR_HEIGHT = 64
export const TAB_BAR_BOTTOM_MARGIN = 8
export const TAB_BAR_SIDE_MARGIN = 24

const LENS_SIZE = 40

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

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: TAB_BAR_SIDE_MARGIN,
        right: TAB_BAR_SIDE_MARGIN,
        bottom: insets.bottom + TAB_BAR_BOTTOM_MARGIN,
        shadowColor: 'rgb(0, 0, 0)',
        shadowOpacity: 0.7,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
      }}
    >
      <GlassSurface
        style={{
          height: TAB_BAR_HEIGHT,
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
              <View
                className="items-center justify-center"
                style={{ width: LENS_SIZE, height: LENS_SIZE }}
              >
                {focused && (
                  <View
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.16)' }}
                  />
                )}
                {options.tabBarIcon?.({
                  focused,
                  color: focused ? colors.content : 'rgba(255, 255, 255, 0.55)',
                  size: 22,
                })}
                {options.tabBarBadge != null && (
                  <View className="absolute -right-1.5 -top-0.5 h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1">
                    <Text className="text-[10px] font-bold text-content">
                      {options.tabBarBadge}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          )
        })}
      </GlassSurface>
    </View>
  )
}
