import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SheetModal } from '@/shared/components/SheetModal'
import { Button } from '@/shared/components/Button'

type Props = {
  visible: boolean
  onCopy: () => void
  onClose: () => void
}

// Aparece na VOLTA ao app com o composer do Instagram aberto (só iOS — no
// Android o link já foi copiado antes do handoff). Fica na tela até o usuário
// copiar ou dispensar, de propósito: banner sozinho evaporava antes de o
// usuário se orientar de volta no app. O hook já fez uma cópia silenciosa de
// segurança; o botão é a ação explícita — re-copia e confirma com banner.
export function StoryLinkReturnSheet({ visible, onCopy, onClose }: Props) {
  const { t } = useTranslation()

  return (
    <SheetModal visible={visible} onClose={onClose}>
      <View className="px-5 pt-2 pb-6 gap-3">
        <Text className="text-xl font-bold text-content">
          {t('events.share.stories.returnSheet.title')}
        </Text>
        <Text className="text-sm text-content-muted leading-5">
          {t('events.share.stories.returnSheet.body')}
        </Text>
        <View className="pt-2">
          <Button
            label={t('events.share.stories.returnSheet.copy')}
            onPress={onCopy}
          />
        </View>
      </View>
    </SheetModal>
  )
}
