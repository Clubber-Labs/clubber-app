import { useEffect, useRef, useState } from 'react'
import { Animated, StyleSheet } from 'react-native'
import { SplashScreen } from './SplashScreen'

type Props = {
  visible: boolean
  showWordmark: boolean
  // Primeiro frame do overlay na tela — hora de esconder a splash nativa
  // (expo-splash-screen) sem flash preto entre as duas.
  onMounted: () => void
}

// Overlay global de boot (montado uma única vez no RootLayout, acima de tudo).
// Entra sem animação; quando visible vira false, sai num fade de 200ms e só
// então desmonta — o conteúdo/redirect já aconteceu por baixo.
export function SplashOverlay({ visible, showWordmark, onMounted }: Props) {
  const opacity = useRef(new Animated.Value(1)).current
  const [rendered, setRendered] = useState(visible)
  const notifiedMount = useRef(false)

  useEffect(() => {
    if (visible) {
      opacity.setValue(1)
      setRendered(true)
      return
    }
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setRendered(false)
    })
  }, [visible, opacity])

  if (!rendered) return null

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { opacity, zIndex: 9999, elevation: 9999 },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
      onLayout={() => {
        if (notifiedMount.current) return
        notifiedMount.current = true
        onMounted()
      }}
    >
      <SplashScreen showWordmark={showWordmark} />
    </Animated.View>
  )
}
