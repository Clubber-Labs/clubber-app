import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Redirect, useLocalSearchParams } from 'expo-router'
import { useEvent } from '@/features/events/hooks/useEvents'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import { useAuthStore } from '@/features/auth/store/authStore'
import { PromoteEventCard } from '@/features/featured-events/components/PromoteEventCard'
import { colors } from '@/shared/theme'

// A promoção saiu do detalhe (virou linha na seção de divulgação) e ganhou tela
// própria: o formulário tem dois pickers de data e não cabe mais no fluxo do
// pôster.
export default function PromoteEventScreen() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const userId = useAuthStore(state => state.userId)
  const { data: event, isLoading, isError } = useEvent(id)
  const { data: profile, isLoading: profileLoading } = useMyProfile()

  if (isLoading || profileLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.brandEmphasis} />
      </View>
    )
  }

  if (isError || !event) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-content-secondary text-center">
          {t('events.detail.loadError')}
        </Text>
      </View>
    )
  }

  // Gate em render: promover é do autor. O backend já bloqueia, aqui é só pra
  // não montar UI inconsistente em deep link.
  if (userId && event.authorId !== userId) {
    return <Redirect href={`/events/${id}`} />
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      <PromoteEventCard
        eventId={event.id}
        eventDate={event.date}
        isPremium={!!profile?.isPremium}
        isFeatured={!!event.isFeatured}
      />
    </ScrollView>
  )
}
