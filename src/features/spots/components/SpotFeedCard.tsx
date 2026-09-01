import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'
import { CardHighlightFrame } from '@/shared/components/CardHighlightFrame'
import { useCategories } from '@/shared/hooks/useCategories'
import { useOpenInMaps } from '@/shared/lib/openInMaps'
import { eventCategoryEmoji } from '@/shared/utils/eventCategoryEmoji'
import { isSpotLiveNow } from '../utils/spotWindow'
import { SpotFeedMap } from './SpotFeedMap'
import { SpotPulseRow } from './SpotPulseRow'
import { SpotCountdown } from './SpotCountdown'
import { SpotJoinButton } from './SpotJoinButton'
import type { Spot } from '../types'
import { SPECTRUM } from '@/shared/theme'

type Props = {
  spot: Spot
  // Coords do usuário [lng, lat] pra distância e rastro. A tela é dona da
  // localização: o useUserLocation monta estado e listener de AppState próprios
  // a cada chamada, então um por card sairia caro numa lista.
  userCoords: [number, number] | null
}

/**
 * Card do rolê no feed: mini-mapa + pulso social. O rolê não é um pôster — não
 * tem capa de foto, não tem RSVP nem curtida. O que ele tem é um LUGAR (a capa
 * é o mapa dele, com o balão branco da identidade plantado no ponto), GENTE (a
 * pilha de quem já está) e uma porta só: o chat.
 *
 * Rolando agora, o card ganha a moldura do espectro — a mesma do evento ONGOING
 * — e um countdown da janela; agendado, mostra a descrição e a faixa de horário.
 */
export function SpotFeedCard({ spot, userCoords }: Props) {
  const { t } = useTranslation()
  const router = useRouter()
  const openInMaps = useOpenInMaps()
  const { labelFor } = useCategories()
  const viewerId = useAuthStore(state => state.userId)

  const live = isSpotLiveNow(spot.startsAt, spot.endsAt)
  const isCreator = !!viewerId && viewerId === spot.creator.id
  const category = spot.categories[0]
  const emoji = eventCategoryEmoji(spot.categories)
  // Rolê só com o criador: a assinatura dele já É a linha do pulso acima, e
  // repeti-la aqui seria eco.
  const solo = spot.memberCount <= 1
  const meta = solo
    ? null
    : t('spots.feedCard.byUser', { username: spot.creator.username })

  const card = (
    // Aresta em `line` como a do card de evento (lá desenhada por causa do
    // picote; aqui, sem recorte, o border serve). Ao vivo a moldura é a aresta.
    <View
      className={`overflow-hidden rounded-xl bg-surface ${
        live ? '' : 'border border-line'
      }`}
    >
      <Pressable onPress={() => router.push(`/spots/${spot.id}`)}>
        <SpotFeedMap
          spot={spot}
          live={live}
          isCreator={isCreator}
          userCoords={userCoords}
          onOpenMaps={() =>
            openInMaps({
              latitude: spot.latitude,
              longitude: spot.longitude,
              address: spot.placeName ?? spot.address ?? undefined,
            })
          }
        />

        <View className="gap-3 p-3">
          <SpotPulseRow spot={spot} live={live} />

          <View className="gap-2">
            {/* Mesma pílula do card de evento, um degrau acima do fundo: ali
                ela pousa sobre a capa, aqui sobre a superfície do card. */}
            {!!category && (
              <View className="flex-row items-center gap-1 self-start rounded-full bg-surface-elevated px-2.5 py-1">
                <Text className="text-[11px]">{emoji}</Text>
                <Text className="text-[11px] font-bold text-content-secondary">
                  {labelFor(category)}
                </Text>
              </View>
            )}

            <View className="gap-1">
              <Text
                className="text-[19px] font-extrabold leading-tight text-content"
                numberOfLines={2}
              >
                {spot.title}
              </Text>
              {!!meta && (
                <Text className="text-xs text-content-muted" numberOfLines={1}>
                  {meta}
                </Text>
              )}
            </View>
          </View>

          {!!spot.description && (
            <Text className="text-[13px] text-content-muted" numberOfLines={1}>
              {spot.description}
            </Text>
          )}

          {live && (
            <SpotCountdown startsAt={spot.startsAt} endsAt={spot.endsAt} />
          )}
        </View>
      </Pressable>

      <View className="px-3 pb-3">
        <SpotJoinButton spot={spot} live={live} isCreator={isCreator} />
      </View>
    </View>
  )

  if (!live) return <View className="mb-10">{card}</View>

  return (
    <View className="relative mb-10">
      {card}
      <CardHighlightFrame stops={SPECTRUM} />
    </View>
  )
}
