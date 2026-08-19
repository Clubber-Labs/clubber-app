import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ShieldCheckIcon } from 'phosphor-react-native'
import { Button } from '@/shared/components/Button'
import { SpotSheetState } from './SpotSheetState'

type Props = {
  // O consentimento LGPD vive na tela de privacidade (com sync próprio) — ambos
  // os caminhos levam pra lá; não dá pra ativar inline sem burlar o fluxo.
  onOpenPrivacy: () => void
}

// Caminho infeliz: sem consentimento de localização precisa, a IA não pode
// sugerir. Estado dedicado (LGPD) com o caminho pra ativar.
export function SpotConsentNeeded({ onOpenPrivacy }: Props) {
  const { t } = useTranslation()
  return (
    <SpotSheetState
      icon={ShieldCheckIcon}
      title={t('spots.consent.title')}
      description={t('spots.consent.description')}
    >
      <View className="w-full gap-2 mt-1">
        <Button label={t('spots.consent.enable')} onPress={onOpenPrivacy} />
        <Pressable
          onPress={onOpenPrivacy}
          className="items-center py-1"
          accessibilityRole="button"
        >
          <Text className="text-content-muted text-sm font-semibold">
            {t('spots.consent.openPrivacy')}
          </Text>
        </Pressable>
      </View>
    </SpotSheetState>
  )
}
