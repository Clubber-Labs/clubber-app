import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'

type Props = {
  kind: 'idle' | 'no-results'
}

// Chave, não frase: constante avaliada no import congelaria o idioma.
const MESSAGE_KEYS = {
  idle: 'users.search.idle',
  'no-results': 'users.search.noResults',
} as const

export function UserSearchEmpty({ kind }: Props) {
  const { t } = useTranslation()
  return (
    <View className="items-center py-12 px-6">
      <Text className="text-content-muted text-center text-sm">
        {t(MESSAGE_KEYS[kind])}
      </Text>
    </View>
  )
}
