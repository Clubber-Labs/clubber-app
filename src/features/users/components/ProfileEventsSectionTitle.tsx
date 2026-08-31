import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'

// Cabeçalho da vitrine, compartilhado pelo perfil próprio e pelo de terceiros —
// eram dois blocos idênticos copiados nas duas telas.
//
// Sem contagem de propósito: quem conta a vitrine é o `eventsCount` do perfil,
// logo acima na linha de stats. Repetir o número aqui era o mesmo dado duas
// vezes na mesma tela.
export function ProfileEventsSectionTitle() {
  const { t } = useTranslation()
  return (
    <View className="flex-row items-baseline gap-2 px-4 pb-3 pt-5">
      <Text
        className="text-[15px] font-extrabold uppercase text-content"
        style={{ letterSpacing: 1 }}
      >
        {t('profile.eventsSection')}
      </Text>
    </View>
  )
}
