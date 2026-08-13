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
import type { Icon } from 'phosphor-react-native'
import { useProfileDrawer } from '../store/profileDrawerStore'
import { GlassSurface } from '@/shared/components/GlassSurface'
import { useHeaderClearance } from '@/shared/hooks/useHeaderClearance'
import { colors } from '@/shared/theme'

export type DrawerItem = {
  label: string
  icon: Icon
  badge?: string | number
  onPress: () => void
}

type Props = {
  items: DrawerItem[]
  header?: React.ReactNode
}

const SCREEN_WIDTH = Dimensions.get('window').width
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 320)

// Divisores entre os itens no mesmo hairline da borda do vidro.
const GLASS_DIVIDER = { borderTopColor: 'rgba(255, 255, 255, 0.13)' }
const ANIMATION_MS = 220

export function ProfileDrawer({ items, header }: Props) {
  const { open, setOpen } = useProfileDrawer()
  const headerClearance = useHeaderClearance(0)
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
        className="h-full"
      >
        {/* Vidro do painel: só o hairline da direita (é uma folha lateral).
            O conteúdo começa abaixo do header flutuante; o vidro segue até o
            topo e o header desfoca por cima. */}
        <GlassSurface
          style={{
            flex: 1,
            paddingTop: headerClearance,
            borderWidth: 0,
            borderRightWidth: 1,
          }}
        >
          {header}
          <View className="py-2">
            {items.map((item, i) => (
              <Pressable
                key={item.label}
                onPress={() => handleItemPress(item)}
                className={`flex-row items-center justify-between px-5 py-4 ${i > 0 ? 'border-t' : ''}`}
                style={i > 0 ? GLASS_DIVIDER : undefined}
              >
                <View className="flex-row items-center gap-3">
                  <item.icon size={20} color={colors.contentSecondary} />
                  <Text className="text-base font-medium text-content">
                    {item.label}
                  </Text>
                </View>
                {shouldShowBadge(item.badge) && (
                  <View className="bg-danger rounded-full min-w-5 h-5 px-1.5 items-center justify-center">
                    <Text className="text-content text-xs font-bold">
                      {item.badge}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </GlassSurface>
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
