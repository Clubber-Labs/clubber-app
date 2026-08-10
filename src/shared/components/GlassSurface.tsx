import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { BlurView } from 'expo-blur'

type Props = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

// Receita única do "liquid glass" (tab bar, controles do mapa): blur escuro +
// véu cinza neutro + borda hairline. Raio e layout vêm do consumidor.
export function GlassSurface({ children, style }: Props) {
  return (
    <BlurView
      tint="dark"
      intensity={50}
      experimentalBlurMethod="dimezisBlurView"
      style={[
        {
          overflow: 'hidden',
          backgroundColor: 'rgba(120, 120, 128, 0.13)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.13)',
        },
        style,
      ]}
    >
      {children}
    </BlurView>
  )
}
