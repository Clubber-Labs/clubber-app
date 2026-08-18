import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { CaretLeftIcon, LockIcon } from 'phosphor-react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEvent } from '@/features/events/hooks/useEvents'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useEventAnalytics } from '@/features/event-analytics/hooks/useEventAnalytics'
import { AnalyticsSummaryCards } from '@/features/event-analytics/components/AnalyticsSummaryCards'
import { AnalyticsLineChart } from '@/features/event-analytics/components/AnalyticsLineChart'
import { AnalyticsExportButton } from '@/features/event-analytics/components/AnalyticsExportButton'
import { PremiumAnalyticsGate } from '@/features/event-analytics/components/PremiumAnalyticsGate'
import { Button } from '@/shared/components/Button'
import { formatRelative } from '@/shared/utils/dateFormat'
import { useLocale } from '@/shared/hooks/useLocale'
import { colors } from '@/shared/theme'

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-row items-center gap-3 px-4 pt-4 pb-3 border-b border-line">
      <Pressable onPress={onBack} hitSlop={12}>
        <CaretLeftIcon size={24} color={colors.content} />
      </Pressable>
      <Text className="text-content font-bold text-xl">
        Analytics do evento
      </Text>
    </View>
  )
}

export default function EventAnalyticsScreen() {
  const locale = useLocale()
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const userId = useAuthStore(s => s.userId)
  const {
    data: event,
    isLoading: eventLoading,
    isError: eventError,
  } = useEvent(id)
  const { data: profile, isLoading: profileLoading } = useMyProfile()

  const isAuthor = !!event && !!userId && event.authorId === userId
  const isPremium = !!profile?.isPremium
  const eligible = isAuthor && isPremium

  const {
    stats,
    isLoading: statsLoading,
    isError,
    refresh,
    isRefreshing,
  } = useEventAnalytics(id, { enabled: eligible })

  const back = () => router.back()

  // Precisamos de evento + perfil pra decidir o gate.
  if (eventLoading || profileLoading) {
    return (
      <View className="flex-1 bg-background">
        <Header onBack={back} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.brandEmphasis} />
        </View>
      </View>
    )
  }

  if (eventError || !event) {
    return (
      <View className="flex-1 bg-background">
        <Header onBack={back} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-content-muted text-center text-sm">
            Não foi possível carregar o evento.
          </Text>
        </View>
      </View>
    )
  }

  // Acesso direto por quem não é autor (deep link): sem dashboard.
  if (!isAuthor) {
    return (
      <View className="flex-1 bg-background">
        <Header onBack={back} />
        <View className="flex-1 items-center justify-center px-8 gap-2">
          <LockIcon size={32} color={colors.contentSubtle} />
          <Text className="text-content-secondary font-semibold text-base text-center">
            Analytics indisponível
          </Text>
          <Text className="text-content-muted text-sm text-center">
            Apenas o autor do evento pode ver as estatísticas.
          </Text>
        </View>
      </View>
    )
  }

  if (!isPremium) {
    return (
      <View className="flex-1 bg-background">
        <Header onBack={back} />
        <PremiumAnalyticsGate />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <Header onBack={back} />

      {statsLoading && !stats ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.brandEmphasis} />
        </View>
      ) : isError && !stats ? (
        <View className="flex-1 items-center justify-center px-8 gap-3">
          <Text className="text-content-muted text-center text-sm">
            Não foi possível carregar as estatísticas.
          </Text>
          <Button
            label="Tentar novamente"
            variant="secondary"
            onPress={() => refresh()}
            loading={isRefreshing}
          />
        </View>
      ) : stats ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-content-subtle text-xs mb-3">
            Atualizado {formatRelative(stats.updatedAt, locale)}
          </Text>

          <AnalyticsSummaryCards totals={stats.totals} />

          <Text className="text-content-secondary font-semibold text-base mt-6 mb-3">
            Atividade por dia
          </Text>
          <AnalyticsLineChart timeline={stats.timeline} />

          <View className="mt-6 gap-3">
            <Button
              label="Atualizar"
              variant="secondary"
              onPress={() => refresh()}
              loading={isRefreshing}
            />
            <AnalyticsExportButton eventId={id} />
          </View>
        </ScrollView>
      ) : null}
    </View>
  )
}
