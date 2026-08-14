import { View } from 'react-native'
import { colors } from '@/shared/theme'
import { BrandB } from './BrandB'

// O b como adesivo: círculo sólido + rotação fixa de -8°. Voz expressiva
// da marca (wordmark, splash, onboarding, social) — nunca vira botão/ícone de ação.
// inverted: adesivo sobre superfície CLARA (dentro do BrandStickerWordmark).
// Além de trocar as cores de papel, sai a sombra — ela existe pra descolar do
// fundo escuro e sobre o claro vira halo sujo.
export function BrandSticker({
  size = 44,
  inverted = false,
}: {
  size?: number
  inverted?: boolean
}) {
  const shadow = inverted
    ? null
    : {
        shadowColor: 'rgb(0, 0, 0)',
        shadowOpacity: 0.55,
        shadowRadius: size * 0.2,
        shadowOffset: { width: 0, height: size * 0.1 },
        elevation: 12,
      }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: inverted ? colors.background : colors.content,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-8deg' }],
        ...shadow,
      }}
    >
      <BrandB
        size={size * 0.66}
        color={inverted ? colors.content : colors.background}
      />
    </View>
  )
}
