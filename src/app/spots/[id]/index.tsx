import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import {
  CaretRightIcon,
  XCircleIcon,
  ClockIcon,
  UsersIcon,
  NavigationArrowIcon,
  ChatCircleDotsIcon,
} from 'phosphor-react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useConfirm } from '@/shared/lib/confirm'
import { useOpenInMaps } from '@/shared/lib/openInMaps'
import {
  getApiError,
  isNotFoundError,
  isTooManyRequestsError,
} from '@/shared/lib/apiError'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { SheetModal } from '@/shared/components/SheetModal'
import { CategoryBadge } from '@/shared/components/CategoryBadge'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { EventMap } from '@/features/events/components/EventMap'
import { useNavigateToProfile } from '@/features/users/hooks/useNavigateToProfile'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import { useSpot } from '@/features/spots/hooks/useSpot'
import { useJoinSpot } from '@/features/spots/hooks/useJoinSpot'
import { useCancelSpot } from '@/features/spots/hooks/useCancelSpot'
import { useRenewSpot } from '@/features/spots/hooks/useRenewSpot'
import { formatSpotWindow } from '@/features/spots/utils/spotWindow'
import { SpotOwnerActions } from '@/features/spots/components/SpotOwnerActions'
import { SpotQuotaExhausted } from '@/features/spots/components/SpotQuotaExhausted'
import { colors } from '@/shared/theme'

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
  // 429 no renovar (mesma cota diária do gerar) → folha de cota esgotada com
  // upsell, em vez de erro inline.
  const [renewQuotaReached, setRenewQuotaReached] = useState(false)
  const { data: profile } = useMyProfile()
  const isPremium = !!profile?.isPremium
  const highlightRenew = renewParam === '1'

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.brandEmphasis} />
      </View>
    )
  }

  if (error || !spot) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6 gap-3">
        <Text className="text-content-secondary text-center">
          {/* 404 também cobre privado/bloqueio — não revelar existência. */}
          {isNotFoundError(error)
            ? 'Spot não encontrado.'
            : 'Não foi possível carregar o spot.'}
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-brand-text font-semibold">Voltar</Text>
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
      // 429 = cota diária esgotada (a mesma do gerar) → estado dedicado com
      // upsell do Premium, igual ao fluxo de sugestões. 409 (cancelado/
      // encerrado) e demais ficam inline.
      onError: err => {
        if (isTooManyRequestsError(err)) setRenewQuotaReached(true)
        else setRenewError(getApiError(err).message)
      },
    })
  }

  async function handleCancel() {
    const ok = await confirm({
      title: 'Cancelar rolê',
      message:
        'O rolê sai do mapa pra todo mundo. O grupo de chat continua existindo.',
      confirmLabel: 'Cancelar rolê',
      destructive: true,
    })
    if (!ok) return
    cancel.mutate(undefined, { onSuccess: () => router.back() })
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 18 }}
      >
        <Pressable
          onPress={() => navigateToProfile(spot.creator.id)}
          className="flex-row items-center gap-3"
        >
          <UserAvatar
            name={`${spot.creator.name} ${spot.creator.lastname}`}
            avatarUrl={spot.creator.avatarUrl}
            size={42}
          />
          <View className="flex-1">
            <Text className="text-content text-sm font-semibold">
              {spot.creator.name} {spot.creator.lastname}
            </Text>
            <Text className="text-content-subtle text-xs">
              @{spot.creator.username} sugeriu esse rolê
            </Text>
          </View>
          <CaretRightIcon size={16} color={colors.contentFaint} />
        </Pressable>

        <View className="gap-2.5">
          <Text className="text-content text-2xl font-bold leading-tight">
            {spot.title}
          </Text>
          <View className="flex-row items-center">
            {isCanceled ? (
              <View className="flex-row items-center gap-1.5 rounded-md bg-danger/10 border border-danger/30 px-2.5 py-1">
                <XCircleIcon
                  weight="fill"
                  size={12}
                  color={colors.dangerText}
                />
                <Text className="text-danger-text text-[11px] font-bold">
                  cancelado
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-1.5 rounded-md bg-success/20 border border-success/30 px-2.5 py-1">
                <View className="w-1.5 h-1.5 rounded-full bg-success-text" />
                <Text className="text-success-text text-[11px] font-bold">
                  no ar
                </Text>
              </View>
            )}
          </View>
          {isCanceled && (
            <Text className="text-content-muted text-sm">
              Esse rolê foi cancelado e saiu do mapa. O grupo de chat continua
              existindo.
            </Text>
          )}
          {spot.description && (
            <Text className="text-content-tertiary text-base leading-relaxed">
              {spot.description}
            </Text>
          )}
        </View>

        <View className="flex-row flex-wrap gap-2">
          {spot.categories.map(category => (
            <CategoryBadge key={category} value={category} />
          ))}
          {(spot.subcategories ?? []).map(subcategory => (
            <CategoryBadge key={subcategory} value={subcategory} />
          ))}
        </View>

        <View className="bg-surface border border-line rounded-2xl overflow-hidden">
          <View className="flex-row items-center gap-3 px-4 py-3.5">
            <View className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-surface-strong items-center justify-center">
              <ClockIcon size={20} color={colors.brandText} />
            </View>
            <View className="flex-1">
              <Text className="text-content-subtle text-[11px] font-semibold">
                Quando
              </Text>
              <Text className="text-content-secondary text-sm font-semibold mt-0.5">
                {formatSpotWindow(spot.startsAt, spot.endsAt)}
              </Text>
            </View>
          </View>
          <View className="h-px bg-line mx-4" />
          <View className="flex-row items-center gap-3 px-4 py-3.5">
            <View className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-surface-strong items-center justify-center">
              <UsersIcon size={20} color={colors.brandText} />
            </View>
            <View className="flex-1">
              <Text className="text-content-subtle text-[11px] font-semibold">
                Grupo do rolê
              </Text>
              <Text className="text-content-secondary text-sm font-semibold mt-0.5">
                {memberLabel}
              </Text>
            </View>
          </View>
        </View>

        <View className="relative">
          <EventMap
            latitude={spot.latitude}
            longitude={spot.longitude}
            marker="spot"
          />
          <Pressable
            onPress={() =>
              openInMaps({ latitude: spot.latitude, longitude: spot.longitude })
            }
            accessibilityRole="button"
            className="absolute bottom-3 right-3 flex-row items-center gap-1.5 bg-surface-sunken/95 border border-line-strong rounded-lg px-3 py-2"
          >
            <NavigationArrowIcon size={14} color={colors.contentSecondary} />
            <Text className="text-content-secondary text-xs font-bold">
              Como chegar
            </Text>
          </Pressable>
        </View>

        {!isCanceled && (
          <View className="gap-2">
            <Button
              label={
                isCreator ? 'Abrir chat do grupo' : 'Entrar no chat do rolê'
              }
              icon={ChatCircleDotsIcon}
              onPress={handleJoin}
              loading={join.isPending}
            />
            <FormError message={joinError} />
          </View>
        )}

        {isCreator && !isCanceled && (
          <SpotOwnerActions
            highlightRenew={highlightRenew}
            onRenew={handleRenew}
            onEdit={() => router.push(`/spots/${spot.id}/edit`)}
            onCancel={handleCancel}
            renewing={renew.isPending}
            canceling={cancel.isPending}
            renewError={renewError}
          />
        )}
      </ScrollView>

      <SheetModal
        visible={renewQuotaReached}
        onClose={() => setRenewQuotaReached(false)}
      >
        <View className="px-5 pb-2">
          <SpotQuotaExhausted
            isPremium={isPremium}
            onUpgrade={() => {
              setRenewQuotaReached(false)
              router.push('/billing/upgrade')
            }}
            onSeeMap={() => {
              setRenewQuotaReached(false)
              router.replace('/(tabs)/map')
            }}
          />
        </View>
      </SheetModal>
    </>
  )
}
