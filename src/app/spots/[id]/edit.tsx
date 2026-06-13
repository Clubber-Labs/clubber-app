import { useState } from 'react'
import { View, Text, ActivityIndicator, Pressable } from 'react-native'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'
import { getApiError } from '@/shared/lib/apiError'
import { useSpot } from '@/features/spots/hooks/useSpot'
import { useUpdateSpot } from '@/features/spots/hooks/useUpdateSpot'
import { EditSpotForm } from '@/features/spots/components/EditSpotForm'
import type { EditSpotInput } from '@/features/spots/schemas/editSpotSchema'
import { colors } from '@/shared/theme'

export default function EditSpotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const myId = useAuthStore(s => s.userId)
  const { data: spot, isLoading } = useSpot(id)
  const update = useUpdateSpot(id)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Gate em render: não-criador volta pra detail sem montar o form (o backend
  // já bloqueia o PATCH com 403).
  if (spot && myId && spot.creator.id !== myId) {
    return <Redirect href={`/spots/${id}`} />
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.brandEmphasis} />
      </View>
    )
  }

  if (!spot) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6 gap-3">
        <Text className="text-content-secondary text-center">
          Não foi possível carregar o spot.
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-brand-text font-semibold">Voltar</Text>
        </Pressable>
      </View>
    )
  }

  function handleSubmit(data: EditSpotInput) {
    setSubmitError(null)
    update.mutate(data, {
      onSuccess: () => router.back(),
      // 403/404/409 (cancelado) — reflete a mensagem do backend.
      onError: error => setSubmitError(getApiError(error).message),
    })
  }

  return (
    <View className="flex-1 bg-background">
      <EditSpotForm
        spot={spot}
        onSubmit={handleSubmit}
        submitting={update.isPending}
        submitError={submitError}
      />
    </View>
  )
}
