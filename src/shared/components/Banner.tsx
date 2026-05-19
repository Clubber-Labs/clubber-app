import { useEffect, useRef } from 'react'
import { Animated, Easing, Pressable, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = {
  message: string
  onDismiss: () => void
}

export function Banner({ message, onDismiss }: Props) {
  const insets = useSafeAreaInsets()
  const translateY = useRef(new Animated.Value(-300)).current

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [translateY])

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        transform: [{ translateY }],
      }}
      className="bg-black"
    >
      <Pressable
        onPress={onDismiss}
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 18,
          paddingHorizontal: 20,
        }}
      >
        <Text className="text-white font-bold text-base text-center">
          {message}
        </Text>
      </Pressable>
    </Animated.View>
  )
}
