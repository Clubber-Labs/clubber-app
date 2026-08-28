import { Platform, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SheetModal } from '@/shared/components/SheetModal'
import { Button } from '@/shared/components/Button'

type Props = {
  visible: boolean
  onConfirm: () => void
  onClose: () => void
}

// Etapa do fluxo de compartilhamento, não enfeite: o sticker de Link é o que
// torna o convite tocável no story, e o caminho até ele ninguém adivinha.
// Confirmação explícita, e não aviso com timeout: logo depois disto o app vai
// pro background, e um toast some junto com a chance de ter sido lido.
//
// Aparece SEMPRE, de propósito. Suprimir depois de N usos ("já sei, não mostra
// mais") depende de saber quantos chegam a usar o sticker — evolução
// condicionada a telemetria, não a palpite.
export function StoryLinkInstructions({ visible, onConfirm, onClose }: Props) {
  const { t } = useTranslation()

  // A diferença por plataforma é de MECANISMO, não de gosto. No Android o link
  // já vai copiado (o Intent não disputa a área de transferência) e a folha só
  // ensina o sticker. No iOS o Instagram limpa o pasteboard ao consumir a arte
  // (ver docs/share-stories-instagram.md), então a cópia acontece na VOLTA ao
  // app — e a folha ensina a dança em dois passos.
  const steps =
    Platform.OS === 'ios'
      ? [
          t('events.share.stories.instructions.iosStep1'),
          t('events.share.stories.instructions.iosStep2'),
        ]
      : [t('events.share.stories.instructions.bodyAndroid')]

  return (
    <SheetModal visible={visible} onClose={onClose}>
      <View className="px-5 pt-2 pb-6 gap-3">
        <Text className="text-xl font-bold text-content">
          {t('events.share.stories.instructions.title')}
        </Text>
        {steps.length === 1 ? (
          <Text className="text-sm text-content-muted leading-5">
            {steps[0]}
          </Text>
        ) : (
          <View className="gap-2">
            {steps.map((step, index) => (
              <View key={step} className="flex-row gap-2">
                <Text className="text-sm font-bold text-content">
                  {index + 1}.
                </Text>
                <Text className="text-sm text-content-muted leading-5 flex-1">
                  {step}
                </Text>
              </View>
            ))}
          </View>
        )}
        <View className="pt-2">
          <Button
            label={t('events.share.stories.instructions.confirm')}
            onPress={onConfirm}
          />
        </View>
      </View>
    </SheetModal>
  )
}
