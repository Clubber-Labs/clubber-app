import { useEffect } from 'react'
import { Modal, View, Text, Pressable } from 'react-native'
import { CaretRightIcon, NavigationArrowIcon } from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { runOnJS } from 'react-native-worklets'
import { Button } from './Button'
import { colors } from '@/shared/theme'

export type MapsOption = {
  key: string
  label: string
  icon: Icon
  onPress: () => void
}

type Props = {
  visible: boolean
  title?: string
  options: MapsOption[]
  onClose: () => void
}

export function MapsChooserSheet({ visible, title, options, onClose }: Props) {
  const insets = useSafeAreaInsets()

  // Arrastar a alça pra baixo fecha: segue o dedo; além do limiar (ou num flick),
  // fecha — o slide do Modal cuida da saída. Reseta ao reabrir.
  const dragY = useSharedValue(0)
  useEffect(() => {
    if (visible) dragY.value = 0
  }, [visible, dragY])

  const dragGesture = Gesture.Pan()
    .onUpdate(e => {
      dragY.value = Math.max(0, e.translationY)
    })
    .onEnd(e => {
      if (e.translationY > 100 || e.velocityY > 800) runOnJS(onClose)()
      else dragY.value = withSpring(0, { damping: 22, stiffness: 220 })
    })
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }],
  }))

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Sem scrim: o fundo (mapa/tela) continua visível — só o tap fecha. */}
      <Pressable className="flex-1 justify-end" onPress={onClose}>
        <Animated.View style={sheetStyle}>
          <Pressable
            className="bg-surface-sunken border-t border-line rounded-t-3xl px-4"
            style={{ paddingBottom: insets.bottom + 16 }}
            onPress={e => e.stopPropagation()}
          >
            <GestureDetector gesture={dragGesture}>
              <View className="pt-3 pb-2">
                <View className="self-center w-10 h-1 rounded-full bg-surface-high" />
              </View>
            </GestureDetector>

            <View className="flex-row items-center gap-3 px-1 pb-3 pt-1">
              <View className="w-11 h-11 rounded-xl bg-brand-surface border border-brand-surface-strong items-center justify-center">
                <NavigationArrowIcon
                  size={20}
                  color={colors.brandText}
                  weight="fill"
                />
              </View>
              <View className="flex-1">
                <Text className="text-content text-base font-bold">
                  Abrir com
                </Text>
                {!!title && (
                  <Text
                    className="text-content-subtle text-xs mt-0.5"
                    numberOfLines={1}
                  >
                    {title}
                  </Text>
                )}
              </View>
            </View>

            <View className="bg-surface border border-line rounded-2xl overflow-hidden">
              {options.map((option, i) => {
                const OptionIcon = option.icon
                return (
                  <View key={option.key}>
                    {i > 0 && <View className="h-px bg-line mx-4" />}
                    <Pressable
                      onPress={option.onPress}
                      accessibilityRole="button"
                      className="flex-row items-center gap-3 px-4 py-3.5 active:bg-surface-elevated"
                    >
                      <View className="w-9 h-9 rounded-lg bg-surface-elevated items-center justify-center">
                        <OptionIcon size={18} color={colors.contentSecondary} />
                      </View>
                      <Text className="flex-1 text-content text-[15px] font-semibold">
                        {option.label}
                      </Text>
                      <CaretRightIcon size={16} color={colors.contentFaint} />
                    </Pressable>
                  </View>
                )
              })}
            </View>

            <View className="mt-3">
              <Button label="Cancelar" variant="neutral" onPress={onClose} />
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  )
}
