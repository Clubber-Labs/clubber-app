import { View, Text } from 'react-native'

// Aviso do grupo (entrou/saiu/renomeou): pílula centralizada, mesmo vocabulário
// do DateSeparator. Não é fala de ninguém — sem autor, sem avatar, sem hora,
// sem swipe e sem long-press. O texto vem pronto do servidor.
export function SystemMessage({ text }: { text: string }) {
  return (
    <View className="items-center my-2 px-8">
      <View className="bg-surface rounded-full px-3 py-1">
        <Text className="text-xs text-content-muted text-center">{text}</Text>
      </View>
    </View>
  )
}
