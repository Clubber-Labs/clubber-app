import { View } from 'react-native'
import { colors } from '@/shared/theme'
import { BrandB } from './BrandB'

// O b como adesivo: círculo sólido + rotação fixa de -8°. Voz expressiva
// da marca (wordmark, splash, onboarding, social) — nunca vira botão/ícone de ação.
export function BrandSticker({ size = 44 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.content,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-8deg' }],
        shadowColor: 'rgb(0, 0, 0)',
        shadowOpacity: 0.55,
        shadowRadius: size * 0.2,
        shadowOffset: { width: 0, height: size * 0.1 },
        elevation: 12,
      }}
    >
      <BrandB size={size * 0.66} color={colors.background} />
    </View>
  )
}
