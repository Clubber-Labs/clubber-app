import { View } from 'react-native'
import { BrandSticker, BrandWordmark } from './brand'

// Overlay de boot (_layout): assume da splash NATIVA, que mostra esta MESMA
// composição — o assets/splash-logo.png sai daqui via scripts/build-splash-logo.
// Os números abaixo espelham scripts/splash-spec.mjs e não podem ser importados
// de lá: o gap é classe do NativeWind, que exige literal pra ser compilada.
// Mexeu em algum? Ajuste o spec e rode `pnpm splash:build`.
// showWordmark: o wordmark exige a Sora carregada — antes disso o slot fica
// vazio (altura reservada, sem pulo) em vez de mostrar a fonte fallback.
export function SplashScreen({
  showWordmark = true,
}: {
  showWordmark?: boolean
}) {
  return (
    <View className="flex-1 bg-background items-center justify-center gap-9">
      <BrandSticker size={180} />
      <View style={{ height: 44, justifyContent: 'center' }}>
        {showWordmark && <BrandWordmark height={35} />}
      </View>
    </View>
  )
}
