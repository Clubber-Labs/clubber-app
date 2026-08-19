import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { FormError } from '@/shared/components/FormError'
import { RadiusSlider } from '@/shared/components/RadiusSlider'
import { getApiError } from '@/shared/lib/apiError'
import {
  useSpotPrefs,
  SPOT_RADIUS_MIN_KM,
  SPOT_RADIUS_MAX_KM,
} from '@/features/spots/hooks/useSpotPrefs'

export default function SpotSettingsScreen() {
  const { t } = useTranslation()
  const { spotRadiusKm, saveRadius } = useSpotPrefs()
  const [error, setError] = useState<string | null>(null)

  // saveRadius é otimista no hook e RE-LANÇA em erro — capturamos aqui pra
  // mostrar o 400 de teto ("Raio máximo permitido: Nkm"); o hook já reverteu.
  function handleCommit(km: number) {
    setError(null)
    saveRadius(km).catch(e => setError(getApiError(e).message))
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4 pt-6 pb-4 border-b border-line">
        <Text className="text-xl font-bold text-content">
          {t('settings.spots')}
        </Text>
        <Text className="text-xs text-content-subtle mt-1">
          {t('settings.spotsScreen.subtitle')}
        </Text>
      </View>

      <View className="mx-4 mt-4 bg-surface-sunken border border-line rounded-xl px-4 py-4 gap-1">
        <RadiusSlider
          label={t('settings.spotsScreen.radiusLabel')}
          min={SPOT_RADIUS_MIN_KM}
          max={SPOT_RADIUS_MAX_KM}
          value={spotRadiusKm}
          onCommit={handleCommit}
        />
        <Text className="text-xs text-content-subtle">
          {t('settings.spotsScreen.radiusHint')}
        </Text>
        <FormError message={error} />
      </View>
    </ScrollView>
  )
}
