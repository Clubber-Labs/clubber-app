import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { InstagramLogoIcon, ShareNetworkIcon } from 'phosphor-react-native'
import { SheetModal } from '@/shared/components/SheetModal'
import { SettingsRow } from '@/shared/components/SettingsRow'

type Props = {
  visible: boolean
  onClose: () => void
  onShareToStories: () => void
  onShareToOtherApps: () => void
}

// Folha de escolha do compartilhamento. Só é aberta quando há mais de um
// caminho — sem Instagram, o botão vai direto pro share do sistema.
export function ShareOptionsSheet({
  visible,
  onClose,
  onShareToStories,
  onShareToOtherApps,
}: Props) {
  const { t } = useTranslation()

  return (
    <SheetModal visible={visible} onClose={onClose}>
      <View className="px-4 pb-2 pt-1">
        <Text className="text-content text-base font-bold">
          {t('events.share.sheetTitle')}
        </Text>
      </View>
      <SettingsRow
        label={t('events.share.stories.option')}
        description={t('events.share.stories.optionHint')}
        icon={InstagramLogoIcon}
        onPress={onShareToStories}
      />
      <SettingsRow
        label={t('events.share.otherApps')}
        icon={ShareNetworkIcon}
        onPress={onShareToOtherApps}
      />
    </SheetModal>
  )
}
