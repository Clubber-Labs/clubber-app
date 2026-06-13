import { View, Text } from 'react-native'

type Props = {
  // Rótulo já resolvido ("Fulano está digitando…"). Vazio → não renderiza.
  label: string
}

// Linha sutil de "digitando…". Em FlatList invertido fica como ListHeaderComponent
// (renderiza na base, logo acima da barra de input).
export function TypingIndicator({ label }: Props) {
  if (!label) return null
  return (
    <View className="px-4 py-1">
      <Text className="text-content-subtle text-xs italic" numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}
