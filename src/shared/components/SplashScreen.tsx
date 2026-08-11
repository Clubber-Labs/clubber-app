import { View } from 'react-native'
import { BrandSticker, BrandWordmark } from './brand'

// Overlay de boot (_layout): assume do splash nativo (b reto) já com a voz
// expressiva da marca — sticker grande + wordmark — até fonte e sessão validarem.
// showWordmark: o wordmark exige a Sora carregada — antes disso o slot fica
// vazio (altura reservada, sem pulo) em vez de mostrar a fonte fallback.
export function SplashScreen({
  showWordmark = true,
}: {
  showWordmark?: boolean
}) {
  return (
    <View className="flex-1 bg-background items-center justify-center gap-6">
      <BrandSticker size={112} />
      <View style={{ height: 28, justifyContent: 'center' }}>
        {showWordmark && <BrandWordmark height={22} />}
      </View>
    </View>
  )
}
