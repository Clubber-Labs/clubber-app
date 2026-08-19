import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { ShieldCheckIcon } from 'phosphor-react-native'
import { DevicePermissionRow } from '@/features/privacy/components/DevicePermissionRow'
import {
  useMyProfile,
  useUpdateProfile,
} from '@/features/users/hooks/useProfile'
import { useNotificationConsent } from '@/features/notifications/hooks/useNotificationConsent'
import { useNotificationPrefs } from '@/features/notifications/hooks/useNotificationPrefs'
import {
  NOTIFY_RADIUS_MIN_KM,
  NOTIFY_RADIUS_MAX_KM,
} from '@/features/notifications/store/notificationPrefsStore'
import { RadiusSlider } from '@/shared/components/RadiusSlider'
import { CategoryMultiSelect } from '@/shared/components/CategoryMultiSelect'
import { InterestsMultiSelect } from '@/shared/components/InterestsMultiSelect'
import { SettingsRow } from '@/shared/components/SettingsRow'

export default function NotificationSettingsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { osPush, osLocation, enableNotifications, enableLocation } =
    useNotificationConsent()
  const { notifyRadiusKm, saveRadius } = useNotificationPrefs()
  const { data: profile } = useMyProfile()
  const updateProfile = useUpdateProfile(profile?.id ?? '')

  // Otimista: o chip reflete o toque na hora; em erro volta pro estado do
  // perfil (PUT substitui a lista completa — ver UpdateMePayload).
  const [localCategories, setLocalCategories] = useState<string[] | null>(null)
  const categories = localCategories ?? profile?.preferredCategories ?? []

  const [localSubcategories, setLocalSubcategories] = useState<string[] | null>(
    null,
  )
  const subcategories =
    localSubcategories ?? profile?.preferredSubcategories ?? []

  function handleCategoriesChange(next: string[]) {
    if (!profile) return
    setLocalCategories(next)
    updateProfile.mutate(
      { preferredCategories: next },
      {
        onError: () => setLocalCategories(profile.preferredCategories ?? []),
      },
    )
  }

  function handleSubcategoriesChange(next: string[]) {
    if (!profile) return
    setLocalSubcategories(next)
    updateProfile.mutate(
      { preferredSubcategories: next },
      {
        onError: () =>
          setLocalSubcategories(profile.preferredSubcategories ?? []),
      },
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4 pt-6 pb-4 border-b border-line">
        <Text className="text-xl font-bold text-content">
          {t('settings.notifications')}
        </Text>
        <Text className="text-xs text-content-subtle mt-1">
          {t('settings.notif.subtitle')}
        </Text>
      </View>

      <View className="mx-4 mt-4 bg-surface-sunken border border-line rounded-xl overflow-hidden">
        {/* Permissão do SISTEMA, não toggle do app: mostra o estado real e
            leva ao lugar onde ele muda de verdade. */}
        <DevicePermissionRow
          label={t('settings.notif.pushLabel')}
          description={t('settings.notif.pushDescription')}
          status={osPush}
          onPress={() => void enableNotifications()}
        />
        <DevicePermissionRow
          label={t('settings.notif.nearbyLabel')}
          description={t('settings.notif.nearbyDescription')}
          status={osLocation}
          onPress={() => void enableLocation()}
          isLast
        />
      </View>

      <View className="mx-4 mt-4 bg-surface-sunken border border-line rounded-xl px-4 py-4">
        <RadiusSlider
          label={t('settings.notif.radiusLabel')}
          min={NOTIFY_RADIUS_MIN_KM}
          max={NOTIFY_RADIUS_MAX_KM}
          value={notifyRadiusKm}
          onCommit={km => void saveRadius(km)}
          disabled={osLocation !== 'granted'}
        />
        <Text className="text-xs text-content-subtle mt-1">
          {t('settings.notif.radiusHint')}
        </Text>
      </View>

      <View className="mx-4 mt-4 bg-surface-sunken border border-line rounded-xl px-4 py-4 gap-2">
        <Text className="text-sm font-semibold text-content">
          {t('settings.notif.categoriesTitle')}
        </Text>
        <Text className="text-xs text-content-subtle">
          {t('settings.notif.categoriesHint')}
        </Text>
        <CategoryMultiSelect
          value={categories}
          onChange={handleCategoriesChange}
        />
      </View>

      <View className="mx-4 mt-4 bg-surface-sunken border border-line rounded-xl px-4 py-4 gap-2">
        <Text className="text-sm font-semibold text-content">
          {t('shared.interests.title')}
        </Text>
        <Text className="text-xs text-content-subtle">
          {t('settings.notif.interestsHint')}
        </Text>
        <InterestsMultiSelect
          value={subcategories}
          onChange={handleSubcategoriesChange}
        />
      </View>

      <View className="mt-6">
        <SettingsRow
          label={t('settings.notif.privacyRow')}
          description={t('settings.notif.privacyRowHint')}
          icon={ShieldCheckIcon}
          onPress={() => router.push('/profile/privacy')}
        />
      </View>
      <Text className="px-4 mt-3 text-xs text-content-faint leading-4">
        {t('settings.notif.retentionNote')}
      </Text>
    </ScrollView>
  )
}
