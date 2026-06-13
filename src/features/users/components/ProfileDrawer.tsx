import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  BackHandler,
  Dimensions,
  Pressable,
  Text,
  View,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import { useProfileDrawer } from '../store/profileDrawerStore'
import { colors } from '@/shared/theme'

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
  const [isVisible, setIsVisible] = useState(false)
  const pendingActionRef = useRef<(() => void) | null>(null)

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
      if (finished) {
        setIsVisible(false)
        const action = pendingActionRef.current
        if (action) {
          pendingActionRef.current = null
          action()
        }
      }
    })
  }, [open, translateX, backdropOpacity])

  // O drawer vive na árvore do app (não num <Modal>), pra manter o header e a
  // tab bar clicáveis. Em troca, o botão físico de voltar do Android — antes
  // coberto pelo onRequestClose do Modal — precisa fechar o drawer aqui.
  useEffect(() => {
    if (!open) return
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setOpen(false)
      return true
    })
    return () => sub.remove()
  }, [open, setOpen])

  // Estado é global (Zustand); ao trocar de aba com o drawer aberto, fecha no
  // blur pra não reaparecer aberto ao voltar ao perfil.
  useFocusEffect(useCallback(() => () => setOpen(false), [setOpen]))

  function close() {
    setOpen(false)
  }

  function handleItemPress(item: DrawerItem) {
    pendingActionRef.current = item.onPress
    close()
  }

  function shouldShowBadge(badge: DrawerItem['badge']): boolean {
    if (typeof badge === 'number') return badge > 0
    return typeof badge === 'string' && badge.length > 0
  }

  if (!isVisible) return null

  return (
    <View className="absolute inset-0 flex-row">
      <Animated.View
        style={{
          transform: [{ translateX }],
          width: DRAWER_WIDTH,
        }}
        className="bg-surface-sunken border-r border-line h-full"
      >
        {header}
        <View className="py-2">
          {items.map((item, i) => (
            <Pressable
              key={item.label}
              onPress={() => handleItemPress(item)}
              className={`flex-row items-center justify-between px-5 py-4 ${i > 0 ? 'border-t border-line-subtle' : ''}`}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={
                    item.destructive ? colors.danger : colors.contentSecondary
                  }
                />
                <Text
                  className={`text-base font-medium ${item.destructive ? 'text-danger-text' : 'text-content'}`}
                >
                  {item.label}
                </Text>
              </View>
              {shouldShowBadge(item.badge) && (
                <View className="bg-brand rounded-full min-w-5 h-5 px-1.5 items-center justify-center">
                  <Text className="text-content text-xs font-bold">
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
        className="bg-background/60"
      >
        <Pressable onPress={close} className="flex-1" />
      </Animated.View>
    </View>
  )
}
