import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { MapPinIcon } from 'phosphor-react-native'
import { Button } from '@/shared/components/Button'
import { SpotSheetState } from '@/features/spots/components/SpotSheetState'
import { useRequestLocationAccess } from '@/features/privacy/hooks/useRequestLocationAccess'

/**
 * Filtro "Rolês" sem localização. Rolê é ancorado num lugar: sem saber onde a
 * pessoa está, o backend não tem o que devolver — e uma lista vazia seca leria
 * como "não tem nada rolando", que é falso.
 *
 * Mesma linguagem visual dos outros caminhos infelizes de rolê
 * (SpotSheetState); o botão entra no caminho único de pedido de acesso, que
 * decide entre prompt do sistema, ajustes e tela de privacidade.
 */
export function FeedSpotsNeedLocation() {
  const { t } = useTranslation()
  const requestLocationAccess = useRequestLocationAccess()

  return (
    <View className="flex-1 justify-center">
      <SpotSheetState
        icon={MapPinIcon}
        title={t('feed.spotsNeedLocation.title')}
        description={t('feed.spotsNeedLocation.description')}
      >
        <View className="w-full mt-1">
          <Button
            label={t('feed.spotsNeedLocation.enable')}
            onPress={() => void requestLocationAccess()}
          />
        </View>
      </SpotSheetState>
    </View>
  )
}
