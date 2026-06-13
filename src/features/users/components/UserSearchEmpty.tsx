import { View, Text } from 'react-native'

type Props = {
  kind: 'idle' | 'no-results'
}

const MESSAGES: Record<Props['kind'], string> = {
  idle: 'Digite pelo menos 2 caracteres para buscar.',
  'no-results': 'Nenhum usuário encontrado.',
}

export function UserSearchEmpty({ kind }: Props) {
  return (
    <View className="items-center py-12 px-6">
      <Text className="text-content-muted text-center text-sm">
        {MESSAGES[kind]}
      </Text>
    </View>
  )
}
