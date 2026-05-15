import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import { useProfileDrawer } from '../store/profileDrawerStore'

type IconName = ComponentProps<typeof Ionicons>['name']

export type DrawerItem = {
  label: string
  icon: IconName
  badge?: string | number
  onPress: () => void
  destructive?: boolean
}

type Props = {
  items: DrawerItem[]
  header?: React.ReactNode
}

const SCREEN_WIDTH = Dimensions.get('window').width
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 320)
const ANIMATION_MS = 220

export function ProfileDrawer({ items, header }: Props) {
  const { open, setOpen } = useProfileDrawer()
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current
  const backdropOpacity = useRef(new Animated.Value(0)).current
  // Modal só desmonta após a animação de saída terminar; senão o drawer
  // "pisca" sem mostrar o slide-out.
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setIsVisible(true)
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: ANIMATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: ANIMATION_MS,
          useNativeDriver: true,
        }),
      ]).start()
      return
    }
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: ANIMATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: ANIMATION_MS,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setIsVisible(false)
    })
  }, [open, translateX, backdropOpacity])

  function close() {
    setOpen(false)
  }

  function handleItemPress(item: DrawerItem) {
    close()
    item.onPress()
  }

  function shouldShowBadge(badge: DrawerItem['badge']): boolean {
    if (typeof badge === 'number') return badge > 0
    return typeof badge === 'string' && badge.length > 0
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={close}
      statusBarTranslucent
    >
      <View className="flex-1 flex-row">
        <Animated.View
          style={{
            transform: [{ translateX }],
            width: DRAWER_WIDTH,
          }}
          className="bg-zinc-950 border-r border-zinc-800 h-full"
        >
          {header}
          <View className="py-2">
            {items.map((item, i) => (
              <Pressable
                key={item.label}
                onPress={() => handleItemPress(item)}
                className={`flex-row items-center justify-between px-5 py-4 ${i > 0 ? 'border-t border-zinc-900' : ''}`}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.destructive ? '#ef4444' : '#e5e7eb'}
                  />
                  <Text
                    className={`text-base font-medium ${item.destructive ? 'text-red-400' : 'text-white'}`}
                  >
                    {item.label}
                  </Text>
                </View>
                {shouldShowBadge(item.badge) && (
                  <View className="bg-violet-600 rounded-full min-w-5 h-5 px-1.5 items-center justify-center">
                    <Text className="text-white text-xs font-bold">
                      {item.badge}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </Animated.View>
        <Animated.View
          style={{ opacity: backdropOpacity, flex: 1 }}
          className="bg-black/60"
        >
          <Pressable onPress={close} className="flex-1" />
        </Animated.View>
      </View>
    </Modal>
  )
}
