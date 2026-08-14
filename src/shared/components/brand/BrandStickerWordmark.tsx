import { View } from 'react-native'
import { colors } from '@/shared/theme'
import { BrandWordmark } from './BrandWordmark'

export function BrandStickerWordmark({ height = 16 }: { height?: number }) {
  const pillHeight = height * 2.8
  return (
    <View
      style={{
        backgroundColor: colors.content,
        borderRadius: 999,
        paddingHorizontal: height * 1.4,
        paddingTop: height * 0.6,
        paddingBottom: height * 0.7,
        transform: [{ rotate: '-5deg' }],
        shadowColor: colors.background,
        shadowOpacity: 0.55,
        shadowRadius: pillHeight * 0.2,
        shadowOffset: { width: 0, height: pillHeight * 0.1 },
        elevation: 12,
      }}
    >
      <BrandWordmark height={height} inverted />
    </View>
  )
}
