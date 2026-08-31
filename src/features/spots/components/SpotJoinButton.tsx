import { useState } from 'react'
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { ChatCircleDotsIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { FormError } from '@/shared/components/FormError'
import { getApiError } from '@/shared/lib/apiError'
import { useJoinSpot } from '../hooks/useJoinSpot'
import type { Spot } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  spot: Spot
  live: boolean
  isCreator: boolean
}

/**
 * Ação única do rolê: entrar no grupo. Não há RSVP nem curtida — ser membro é
 * participar do chat, e é lá que o rolê acontece.
 */
export function SpotJoinButton({ spot, live, isCreator }: Props) {
  const { t } = useTranslation()
  const router = useRouter()
  const join = useJoinSpot(spot.id)
  const [error, setError] = useState<string | null>(null)

  function handlePress() {
    // Criador já é membro desde a publicação — vai direto pro grupo, sem gastar
    // um POST idempotente à toa.
    if (isCreator) {
      router.push(`/conversations/${spot.conversationId}`)
      return
    }
    setError(null)
    join.mutate(undefined, {
      onSuccess: ({ conversationId }) =>
        router.push(`/conversations/${conversationId}`),
      // 403 (só amigos), 404 (sumiu/bloqueio) e 409 (cancelado/encerrado) são
      // decisão do backend — refletimos a mensagem, sem burlar.
      onError: err => setError(getApiError(err).message),
    })
  }

  const label = isCreator
    ? t('spots.feedCard.openChat')
    : live
      ? t('spots.feedCard.joinLive')
      : t('spots.feedCard.join')

  return (
    <View className="gap-2">
      <Pressable
        onPress={handlePress}
        disabled={join.isPending}
        accessibilityRole="button"
        accessibilityState={{ busy: join.isPending }}
        className={`h-12 flex-row items-center justify-center gap-2 rounded-full ${
          join.isPending ? 'bg-surface-elevated' : 'bg-content'
        }`}
      >
        {join.isPending ? (
          <ActivityIndicator size="small" color={colors.contentMuted} />
        ) : (
          <ChatCircleDotsIcon
            size={19}
            weight="fill"
            color={colors.background}
          />
        )}
        <Text
          className={`text-[15px] font-bold ${
            join.isPending ? 'text-content-faint' : 'text-background'
          }`}
        >
          {label}
        </Text>
      </Pressable>
      <FormError message={error} />
    </View>
  )
}
