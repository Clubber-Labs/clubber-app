import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useConfirm } from '@/shared/lib/confirm'
import { useOpenInMaps } from '@/shared/lib/openInMaps'
import { getApiError, isNotFoundError } from '@/shared/lib/apiError'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { CategoryBadge } from '@/shared/components/CategoryBadge'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { EventMap } from '@/features/events/components/EventMap'
import { useNavigateToProfile } from '@/features/users/hooks/useNavigateToProfile'
import { useSpot } from '@/features/spots/hooks/useSpot'
import { useJoinSpot } from '@/features/spots/hooks/useJoinSpot'
import { useCancelSpot } from '@/features/spots/hooks/useCancelSpot'
import { useRenewSpot } from '@/features/spots/hooks/useRenewSpot'
import { formatSpotWindow } from '@/features/spots/utils/spotWindow'

export default function SpotDetailScreen() {
  // renew=1 chega pelo deep-link da notificação SPOT_RENEWAL ("seu rolê está
  // acabando") — destaca o CTA de renovar.
  const { id, renew: renewParam } = useLocalSearchParams<{
    id: string
    renew?: string
  }>()
  const router = useRouter()
  const myId = useAuthStore(s => s.userId)
  const confirm = useConfirm()
  const openInMaps = useOpenInMaps()
  const navigateToProfile = useNavigateToProfile()

  const { data: spot, isLoading, error } = useSpot(id)
  const join = useJoinSpot(id)
  const cancel = useCancelSpot(id)
  const renew = useRenewSpot(id)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [renewError, setRenewError] = useState<string | null>(null)
  const highlightRenew = renewParam === '1'

  if (isLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    )
  }

  if (error || !spot) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6 gap-3">
        <Text className="text-zinc-200 text-center">
          {/* 404 também cobre privado/bloqueio — não revelar existência. */}
          {isNotFoundError(error)
            ? 'Spot não encontrado.'
            : 'Não foi possível carregar o spot.'}
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-violet-400 font-semibold">Voltar</Text>
        </Pressable>
      </View>
    )
  }

  const isCreator = !!myId && spot.creator.id === myId
  const isCanceled = !!spot.canceledAt
  const memberLabel =
    spot.memberCount === 1
      ? '1 pessoa no grupo'
      : `${spot.memberCount} pessoas no grupo`

  function handleJoin() {
    // Criador já é membro desde a publicação — vai direto pro grupo, sem
    // gastar um POST idempotente à toa.
    if (isCreator && spot) {
      router.push(`/conversations/${spot.conversationId}`)
      return
    }
    setJoinError(null)
    join.mutate(undefined, {
      onSuccess: ({ conversationId }) =>
        router.push(`/conversations/${conversationId}`),
      // 403 (só amigos), 404 (sumiu/bloqueio) e 409 (cancelado/encerrado)
      // são decisão do backend — refletimos a mensagem, sem burlar.
      onError: err => setJoinError(getApiError(err).message),
    })
  }

  function handleRenew() {
    setRenewError(null)
    renew.mutate(undefined, {
      // 409 (cancelado/encerrado) e 429 (quota diária, mesma do gerar) —
      // decisão do backend, refletimos a mensagem.
      onError: err => setRenewError(getApiError(err).message),
    })
  }

  async function handleCancel() {
    const ok = await confirm({
      title: 'Cancelar spot',
      message:
        'O spot sai do mapa para todo mundo. O grupo de chat continua existindo.',
      confirmLabel: 'Cancelar spot',
      destructive: true,
    })
    if (!ok) return
    cancel.mutate(undefined, { onSuccess: () => router.back() })
  }

  return (
    <ScrollView
      className="flex-1 bg-black"
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}
    >
      {isCanceled && (
        <View className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <Text className="text-red-400 text-sm font-semibold">
            Este spot foi cancelado.
          </Text>
        </View>
      )}

      <Pressable
        onPress={() => navigateToProfile(spot.creator.id)}
        className="flex-row items-center gap-3"
      >
        <UserAvatar
          name={`${spot.creator.name} ${spot.creator.lastname}`}
          avatarUrl={spot.creator.avatarUrl}
          size={40}
        />
        <View className="flex-1">
          <Text className="text-white text-sm font-semibold">
            {spot.creator.name} {spot.creator.lastname}
          </Text>
          <Text className="text-zinc-500 text-xs">
            @{spot.creator.username} sugeriu esse rolê
          </Text>
        </View>
      </Pressable>

      <View className="gap-2">
        <Text className="text-white text-2xl font-bold">{spot.title}</Text>
        {spot.description && (
          <Text className="text-zinc-300 text-base">{spot.description}</Text>
        )}
      </View>

      <View className="flex-row flex-wrap gap-2">
        {spot.categories.map(category => (
          <CategoryBadge key={category} value={category} />
        ))}
      </View>

      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <Ionicons name="time-outline" size={16} color="#a1a1aa" />
          <Text className="text-zinc-300 text-sm">
            {formatSpotWindow(spot.startsAt, spot.endsAt)}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Ionicons name="people-outline" size={16} color="#a1a1aa" />
          <Text className="text-zinc-300 text-sm">{memberLabel}</Text>
        </View>
      </View>

      <View className="gap-2">
        <EventMap latitude={spot.latitude} longitude={spot.longitude} />
        <Button
          label="Como chegar"
          variant="secondary"
          onPress={() =>
            openInMaps({ latitude: spot.latitude, longitude: spot.longitude })
          }
        />
      </View>

      {!isCanceled && (
        <View className="gap-2">
          <Button
            label={isCreator ? 'Abrir chat do grupo' : 'Entrar no chat do rolê'}
            onPress={handleJoin}
            loading={join.isPending}
          />
          <FormError message={joinError} />
        </View>
      )}

      {isCreator && !isCanceled && (
        <View className="gap-2 border-t border-zinc-900 pt-4">
          {highlightRenew && (
            <Text className="text-violet-300 text-sm text-center">
              Seu rolê está acabando — renove para continuar no mapa.
            </Text>
          )}
          <Button
            label="Renovar por +24h"
            variant={highlightRenew ? 'primary' : 'secondary'}
            onPress={handleRenew}
            loading={renew.isPending}
          />
          <FormError message={renewError} />
          <Button
            label="Editar spot"
            variant="secondary"
            onPress={() => router.push(`/spots/${spot.id}/edit`)}
          />
          <Button
            label="Cancelar spot"
            variant="destructive"
            onPress={handleCancel}
            loading={cancel.isPending}
          />
        </View>
      )}
    </ScrollView>
  )
}
