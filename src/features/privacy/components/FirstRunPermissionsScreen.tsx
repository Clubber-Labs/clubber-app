import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BellRingingIcon, MapPinIcon } from 'phosphor-react-native'
import { useNotificationConsent } from '@/features/notifications/hooks/useNotificationConsent'
import { PermissionRequestRow } from './PermissionRequestRow'

type Props = {
  askPush: boolean
  askLocation: boolean
  onDone: () => void
}

/**
 * Pedido de localização e notificações na primeira entrada no app.
 *
 * Cobre a tela inteira em vez de disparar os prompts nativos direto: no iOS o
 * de push aparece uma única vez na vida do app, e gastá-lo sem dizer o que se
 * ganha é uma recusa que só os Ajustes desfazem. Aqui cada permissão explica o
 * que faz e o toque em "Ativar" é que abre o diálogo do sistema.
 *
 * Quem seguir sem ativar não fica sem caminho: o card do mapa e o priming
 * depois da primeira ação social continuam valendo.
 */
export function FirstRunPermissionsScreen({
  askPush,
  askLocation,
  onDone,
}: Props) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { osPush, osLocation, enableNotifications, enableLocation } =
    useNotificationConsent()

  return (
    <Modal
      visible
      transparent
      statusBarTranslucent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onDone}
    >
      <View className="flex-1 bg-background">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: insets.top + 32,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <View className="flex-1 justify-center gap-8 py-8">
            <View className="gap-3">
              <Text className="text-4xl font-bold text-content">
                {t('privacy.firstRun.title')}
              </Text>
              <Text className="text-base text-content-muted leading-6">
                {t('privacy.firstRun.body')}
              </Text>
            </View>

            <View className="gap-3">
              {askLocation && (
                <PermissionRequestRow
                  icon={MapPinIcon}
                  label={t('privacy.locationLabel')}
                  description={t('privacy.locationDescription')}
                  status={osLocation}
                  onPress={() => void enableLocation()}
                />
              )}
              {askPush && (
                <PermissionRequestRow
                  icon={BellRingingIcon}
                  label={t('privacy.notificationsLabel')}
                  description={t('privacy.notificationsDescription')}
                  status={osPush}
                  onPress={() => void enableNotifications()}
                />
              )}
            </View>
          </View>

          <Pressable
            onPress={onDone}
            className="rounded-full bg-content py-4 items-center active:opacity-80"
          >
            <Text className="text-base font-bold text-background">
              {t('privacy.firstRun.continue')}
            </Text>
          </Pressable>
          <Text className="text-xs text-content-faint text-center mt-3 leading-4">
            {t('privacy.firstRun.footnote')}
          </Text>
        </ScrollView>
      </View>
    </Modal>
  )
}
