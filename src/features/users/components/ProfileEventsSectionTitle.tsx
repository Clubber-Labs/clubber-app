import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'

type Props = {
  // Total do perfil, não o tamanho da página carregada.
  count?: number
}

// Cabeçalho da vitrine, compartilhado pelo perfil próprio e pelo de terceiros —
// eram dois blocos idênticos copiados nas duas telas.
export function ProfileEventsSectionTitle({ count }: Props) {
  const { t } = useTranslation()
  return (
    <View className="flex-row items-baseline gap-2 px-4 pb-3 pt-5">
      <Text
        className="text-[15px] font-extrabold uppercase text-content"
        style={{ letterSpacing: 1 }}
      >
        {t('profile.eventsSection')}
      </Text>
      {!!count && (
        <Text className="text-[13px] font-semibold text-content-subtle">
          {count}
        </Text>
      )}
    </View>
  )
}
