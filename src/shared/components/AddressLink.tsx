import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { useOpenInMaps } from '../lib/openInMaps'
import { hasMapTarget, type MapTarget } from '../utils/mapLinks'

type Props = MapTarget & {
  children: ReactNode
  className?: string
}

// Torna um endereço (texto + ícone) tocável: abre o seletor de apps de mapas.
// Sem alvo de localização, renderiza o conteúdo estático (não vira botão).
export function AddressLink({ children, className, ...target }: Props) {
  const openInMaps = useOpenInMaps()

  if (!hasMapTarget(target)) {
    return <View className={className}>{children}</View>
  }

  return (
    <Pressable
      className={className}
      onPress={() => openInMaps(target)}
      accessibilityRole="button"
      accessibilityHint="Abrir no app de mapas"
    >
      {children}
    </Pressable>
  )
}
