import { useState } from 'react'
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Stack } from 'expo-router'
import {
  ArrowSquareOutIcon,
  DownloadSimpleIcon,
  EnvelopeSimpleIcon,
} from 'phosphor-react-native'
import { ConsentToggleRow } from '@/features/privacy/components/ConsentToggleRow'
import { DevicePermissionRow } from '@/features/privacy/components/DevicePermissionRow'
import { useNotificationConsent } from '@/features/notifications/hooks/useNotificationConsent'
import { useConsent } from '@/features/privacy/hooks/useConsent'
import { useProductPreferences } from '@/features/privacy/hooks/useProductPreferences'
import { CONSENT_VERSION } from '@/features/privacy/services/consentService'
import {
  COMMUNICATION_ITEMS,
  PRODUCT_PREFERENCE_ITEMS,
} from '@/features/privacy/constants'
import { useConfirm } from '@/shared/lib/confirm'
import { useBanner } from '@/shared/lib/banner'
import { openDocument } from '@/shared/lib/openDocument'
import { colors } from '@/shared/theme'

const PRIVACY_URL = 'https://clubber.social/privacidade'
const PRIVACY_EMAIL = 'privacidade@clubber.social'

function SectionTitle({ title, hint }: { title: string; hint: string }) {
  return (
    <View className="px-1 mb-2 mt-6">
      <Text className="text-sm font-semibold text-content">{title}</Text>
      <Text className="text-xs text-content-muted mt-0.5 leading-4">
        {hint}
      </Text>
    </View>
  )
}

export default function PrivacyScreen() {
  const { t } = useTranslation()
  const { consent, isRevoked, updateConsent, revokeAll, exportData } =
    useConsent()
  const { preferences, updatePreference } = useProductPreferences()
  const { osPush, osLocation, enableNotifications, enableLocation } =
    useNotificationConsent()
  const [exporting, setExporting] = useState(false)
  const confirm = useConfirm()
  const showBanner = useBanner()

  async function handleConsentToggle(
    key: 'marketing' | 'surveys',
    value: boolean,
  ) {
    const ok = await updateConsent({ [key]: value })
    if (!ok) showBanner(t('privacy.saveError'))
  }

  async function handlePreferenceToggle(
    key: 'socialFeed' | 'socialVisibility' | 'analytics',
    value: boolean,
  ) {
    const ok = await updatePreference(key, value)
    if (!ok) showBanner(t('privacy.saveError'))
  }

  async function handleExport() {
    if (exporting) return
    setExporting(true)
    try {
      const data = await exportData()
      await Share.share({ message: JSON.stringify(data, null, 2) })
    } catch {
      showBanner(t('privacy.exportError'))
    } finally {
      setExporting(false)
    }
  }

  async function handleRevokeAll() {
    const ok = await confirm({
      title: t('privacy.revokeTitle'),
      message: t('privacy.revokeMessage'),
      confirmLabel: t('privacy.revokeConfirm'),
      destructive: true,
    })
    if (!ok) return
    const done = await revokeAll()
    showBanner(done ? t('privacy.revoked') : t('privacy.revokeError'))
  }

  return (
    <>
      <Stack.Screen options={{ title: t('privacy.title') }} />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      >
        {isRevoked && (
          <View className="bg-surface border border-danger rounded-xl px-4 py-3 mb-2">
            <Text className="text-sm font-semibold text-danger-text">
              {t('privacy.revokedBannerTitle')}
            </Text>
            <Text className="text-xs text-content-muted mt-1 leading-4">
              {t('privacy.revokedBannerBody')}
            </Text>
          </View>
        )}

        {/* Bloco 1 — quem decide é o SO. Nada aqui é switch: um controle que o
            app não consegue honrar faz o usuário arrastar e nada acontecer. */}
        <SectionTitle
          title={t('privacy.deviceTitle')}
          hint={t('privacy.deviceHint')}
        />
        <View className="bg-surface-sunken border border-line rounded-xl overflow-hidden">
          <DevicePermissionRow
            label={t('privacy.locationLabel')}
            description={t('privacy.locationDescription')}
            status={osLocation}
            onPress={() => void enableLocation()}
          />
          <DevicePermissionRow
            label={t('privacy.notificationsLabel')}
            description={t('privacy.notificationsDescription')}
            status={osPush}
            onPress={() => void enableNotifications()}
            isLast
          />
        </View>

        {/* Bloco 2 — consentimento de verdade: opt-in, desligado por padrão. */}
        <SectionTitle
          title={t('privacy.communicationsTitle')}
          hint={t('privacy.communicationsHint')}
        />
        <View className="bg-surface-sunken border border-line rounded-xl overflow-hidden">
          {COMMUNICATION_ITEMS.map((item, index) => (
            <ConsentToggleRow
              key={item.key}
              label={t(item.labelKey)}
              description={t(item.descriptionKey)}
              value={consent[item.key]}
              onChange={value => handleConsentToggle(item.key, value)}
              isLast={index === COMMUNICATION_ITEMS.length - 1}
            />
          ))}
        </View>

        {/* Bloco 3 — preferência de produto: ligada por padrão, opt-out. */}
        <SectionTitle
          title={t('privacy.preferencesTitle')}
          hint={t('privacy.preferencesHint')}
        />
        <View className="bg-surface-sunken border border-line rounded-xl overflow-hidden">
          {PRODUCT_PREFERENCE_ITEMS.map((item, index) => (
            <ConsentToggleRow
              key={item.key}
              label={t(item.labelKey)}
              description={t(item.descriptionKey)}
              value={preferences[item.key]}
              onChange={value => handlePreferenceToggle(item.key, value)}
              isLast={index === PRODUCT_PREFERENCE_ITEMS.length - 1}
            />
          ))}
        </View>

        <SectionTitle
          title={t('privacy.rightsTitle')}
          hint={t('privacy.rightsHint')}
        />
        <View className="bg-surface-sunken border border-line rounded-xl overflow-hidden">
          <Pressable
            onPress={() => openDocument(PRIVACY_URL)}
            className="flex-row items-center justify-between px-4 py-4 border-b border-line active:opacity-70"
          >
            <View className="flex-1">
              <Text className="text-sm font-medium text-content">
                {t('privacy.policy')}
              </Text>
              <Text className="text-xs text-content-subtle mt-0.5">
                {t('privacy.policyVersion', {
                  version: consent.consentVersion ?? CONSENT_VERSION,
                })}
              </Text>
            </View>
            <ArrowSquareOutIcon size={16} color={colors.contentSubtle} />
          </Pressable>

          <Pressable
            onPress={handleExport}
            disabled={exporting}
            className="flex-row items-center justify-between px-4 py-4 border-b border-line active:opacity-70"
          >
            <View className="flex-1">
              <Text className="text-sm font-medium text-content">
                {t('privacy.export')}
              </Text>
              <Text className="text-xs text-content-subtle mt-0.5">
                {t('privacy.exportHint')}
              </Text>
            </View>
            {exporting ? (
              <ActivityIndicator size="small" color={colors.brandText} />
            ) : (
              <DownloadSimpleIcon size={16} color={colors.contentSubtle} />
            )}
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL(`mailto:${PRIVACY_EMAIL}`)}
            className="flex-row items-center justify-between px-4 py-4 border-b border-line active:opacity-70"
          >
            <View className="flex-1">
              <Text className="text-sm font-medium text-content">
                {t('privacy.contact')}
              </Text>
              <Text className="text-xs text-content-subtle mt-0.5">
                {PRIVACY_EMAIL}
              </Text>
            </View>
            <EnvelopeSimpleIcon size={16} color={colors.contentSubtle} />
          </Pressable>

          <Pressable
            onPress={handleRevokeAll}
            className="px-4 py-4 active:opacity-70"
          >
            <Text className="text-sm font-medium text-danger-text">
              {t('privacy.revokeTitle')}
            </Text>
            <Text className="text-xs text-content-subtle mt-0.5">
              {t('privacy.revokeHint')}
            </Text>
          </Pressable>
        </View>

        <Text className="text-content-faint text-xs text-center mt-5 mx-8 leading-4">
          {t('privacy.responseTime')}
        </Text>
      </ScrollView>
    </>
  )
}
