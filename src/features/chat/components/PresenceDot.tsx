import { View } from 'react-native'

type Props = {
  online: boolean
  // Diâmetro do ponto. A borda preta destaca sobre o avatar.
  size?: number
}

// Ponto verde de presença "online". Renderiza null quando offline — o pai
// posiciona (absoluto) sobre o canto do avatar.
export function PresenceDot({ online, size = 12 }: Props) {
  if (!online) return null
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="bg-success border-2 border-background"
    />
  )
}
