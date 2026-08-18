import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
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
        <Text className="text-xl font-bold text-content">Notificações</Text>
        <Text className="text-xs text-content-subtle mt-1">
          Tudo é opcional e desligado por padrão. Você pode mudar quando quiser.
        </Text>
      </View>

      <View className="mx-4 mt-4 bg-surface-sunken border border-line rounded-xl overflow-hidden">
        {/* Permissão do SISTEMA, não toggle do app: mostra o estado real e
            leva ao lugar onde ele muda de verdade. */}
        <DevicePermissionRow
          label="Notificações push"
          description="Convites, atividade da sua rede e eventos perto de você."
          status={osPush}
          onPress={() => void enableNotifications()}
        />
        <DevicePermissionRow
          label="Eventos perto de você"
          description="Usa sua localização aproximada (~1km, calculada no aparelho) para avisar de eventos próximos. A posição exata nunca sai do seu celular."
          status={osLocation}
          onPress={() => void enableLocation()}
          isLast
        />
      </View>

      <View className="mx-4 mt-4 bg-surface-sunken border border-line rounded-xl px-4 py-4">
        <RadiusSlider
          label="Raio de aviso"
          min={NOTIFY_RADIUS_MIN_KM}
          max={NOTIFY_RADIUS_MAX_KM}
          value={notifyRadiusKm}
          onCommit={km => void saveRadius(km)}
          disabled={osLocation !== 'granted'}
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

      <View className="mx-4 mt-4 bg-surface-sunken border border-line rounded-xl px-4 py-4 gap-2">
        <Text className="text-sm font-semibold text-content">Interesses</Text>
        <Text className="text-xs text-content-subtle">
          Refine os avisos por subcategoria e gênero — eventos do seu interesse
          perto de você te alcançam com mais precisão.
        </Text>
        <InterestsMultiSelect
          value={subcategories}
          onChange={handleSubcategoriesChange}
        />
      </View>

      <View className="mt-6">
        <SettingsRow
          label="Privacidade e consentimentos"
          description="Gerenciar todos os consentimentos, exportar dados e ver a política de privacidade"
          icon={ShieldCheckIcon}
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
