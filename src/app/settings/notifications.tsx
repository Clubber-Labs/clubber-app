import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ConsentToggleRow } from '@/features/privacy/components/ConsentToggleRow'
import {
  useMyProfile,
  useUpdateProfile,
} from '@/features/users/hooks/useProfile'
import { useNotificationConsent } from '@/features/notifications/hooks/useNotificationConsent'
import { useNotificationPrefs } from '@/features/notifications/hooks/useNotificationPrefs'
import { RadiusSlider } from '@/features/notifications/components/RadiusSlider'
import { OsPermissionWarning } from '@/features/notifications/components/OsPermissionWarning'
import { CategoryMultiSelect } from '@/shared/components/CategoryMultiSelect'
import { SettingsRow } from '@/shared/components/SettingsRow'

export default function NotificationSettingsScreen() {
  const router = useRouter()
  const {
    pushConsent,
    locationConsent,
    osPush,
    osLocation,
    togglePush,
    toggleLocation,
  } = useNotificationConsent()
  const { notifyRadiusKm, saveRadius } = useNotificationPrefs()
  const { data: profile } = useMyProfile()
  const updateProfile = useUpdateProfile(profile?.id ?? '')

  // Otimista: o chip reflete o toque na hora; em erro volta pro estado do
  // perfil (PUT substitui a lista completa — ver UpdateMePayload).
  const [localCategories, setLocalCategories] = useState<string[] | null>(null)
  const categories = localCategories ?? profile?.preferredCategories ?? []

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

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4 pt-6 pb-4 border-b border-line">
        <Text className="text-xl font-bold text-content">Notificações</Text>
        <Text className="text-xs text-content-subtle mt-1">
          Tudo é opcional e desligado por padrão. Você pode mudar quando quiser.
        </Text>
      </View>

      <View className="mx-4 mt-4 bg-surface-sunken border border-line rounded-xl overflow-hidden">
        <ConsentToggleRow
          label="Notificações push"
          description="Enviar notificações push neste aparelho sobre convites, atividade da sua rede e eventos perto de você."
          value={pushConsent}
          onChange={v => void togglePush(v)}
        />
        {pushConsent && osPush === 'denied' && (
          <OsPermissionWarning message="A permissão de notificações está negada no sistema — o push não chega até você reativá-la." />
        )}
        <ConsentToggleRow
          label="Eventos perto de você"
          description="Usar sua localização aproximada (~1km, calculada no aparelho) para avisar de eventos próximos. A posição exata nunca sai do seu celular."
          value={locationConsent}
          onChange={v => void toggleLocation(v)}
          isLast={!(locationConsent && osLocation === 'denied')}
        />
        {locationConsent && osLocation === 'denied' && (
          <OsPermissionWarning message="A permissão de localização está negada no sistema — os avisos de proximidade não funcionam sem ela." />
        )}
      </View>

      <View className="mx-4 mt-4 bg-surface-sunken border border-line rounded-xl px-4 py-4">
        <RadiusSlider
          value={notifyRadiusKm}
          onCommit={km => void saveRadius(km)}
          disabled={!locationConsent}
        />
        <Text className="text-xs text-content-subtle mt-1">
          Distância máxima de um evento novo para você ser avisado.
        </Text>
      </View>

      <View className="mx-4 mt-4 bg-surface-sunken border border-line rounded-xl px-4 py-4 gap-2">
        <Text className="text-sm font-semibold text-content">
          Categorias preferidas
        </Text>
        <Text className="text-xs text-content-subtle">
          Avisos de eventos próximos só chegam para categorias marcadas aqui —
          sem nenhuma selecionada, você não recebe avisos de proximidade.
        </Text>
        <CategoryMultiSelect
          value={categories}
          onChange={handleCategoriesChange}
        />
      </View>

      <View className="mt-6">
        <SettingsRow
          label="Privacidade e consentimentos"
          description="Gerenciar todos os consentimentos, exportar dados e ver a política de privacidade"
          icon="shield-checkmark-outline"
          onPress={() => router.push('/profile/privacy')}
        />
      </View>
      <Text className="px-4 mt-3 text-xs text-content-faint leading-4">
        Sua localização aproximada expira no servidor após 90 dias sem
        atualização e é apagada imediatamente se você desligar o uso de
        localização. Notificações antigas também expiram no servidor.
      </Text>
    </ScrollView>
  )
}
