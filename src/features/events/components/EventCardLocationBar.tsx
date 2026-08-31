import { View, Text, Pressable } from 'react-native'
import {
  BuildingsIcon,
  CaretRightIcon,
  MapPinIcon,
} from 'phosphor-react-native'
import { GlassSurface } from '@/shared/components/GlassSurface'
import { distanceKm } from '@/shared/utils/distance'
import { useFormatDistance } from '@/shared/hooks/useFormatDistance'
import type { FeedEvent } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  event: Pick<FeedEvent, 'venueName' | 'address' | 'latitude' | 'longitude'>
  // Coords do usuário [lng, lat] — a distância só aparece com elas. Vem do
  // feed (que já resolve a permissão) em vez de cada card pedir a sua: o
  // useUserLocation monta estado e listener de AppState próprios por chamada.
  userCoords: [number, number] | null
  onPress: () => void
  // Sobre foto o vidro desfoca; sobre a capa-gradiente não há o que desfocar,
  // então vira superfície chapada.
  glass?: boolean
}

const RADIUS = 12

// Onde é o rolê, em uma barra tocável ancorada no pé da capa. Substitui a
// meta-row antiga de venue/relógio: o horário migrou pro canhoto, aqui sobrou
// só o lugar — e o lugar é o que decide se a pessoa vai.
export function EventCardLocationBar({
  event,
  userCoords,
  onPress,
  glass = false,
}: Props) {
  const formatDistance = useFormatDistance()
  const place = event.venueName ?? event.address
  if (!place) return null

  const distance = userCoords
    ? formatDistance(distanceKm(userCoords, [event.longitude, event.latitude]))
    : null
  // Com estabelecimento o endereço vira a linha de apoio; sem ele o endereço
  // JÁ é o título da barra e repeti-lo abaixo seria eco.
  const secondary = event.venueName ? event.address : undefined
  const Icon = event.venueName ? BuildingsIcon : MapPinIcon

  const content = (
    <View className="flex-row items-center gap-2.5 px-2.5 py-2">
      <View className="h-[30px] w-[30px] items-center justify-center rounded-lg bg-content/10">
        <Icon size={16} color={colors.content} />
      </View>
      <View className="flex-1">
        <Text className="text-[13px] font-bold text-content" numberOfLines={1}>
          {distance ? `${place} · ${distance}` : place}
        </Text>
        {!!secondary && (
          <Text className="text-[11px] text-content-muted" numberOfLines={1}>
            {secondary}
          </Text>
        )}
      </View>
      <CaretRightIcon size={14} color={colors.contentMuted} />
    </View>
  )

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={place}
      className="overflow-hidden rounded-xl active:opacity-80"
    >
      {glass ? (
        // O véu neutro do GlassSurface fica por baixo; o bg-surface/75 aqui é
        // que dá o corpo pedido pela barra, sem abrir uma segunda receita de
        // vidro no app.
        <GlassSurface style={{ borderRadius: RADIUS }}>
          <View className="bg-surface/75">{content}</View>
        </GlassSurface>
      ) : (
        <View className="border border-line/60 bg-background/50">
          {content}
        </View>
      )}
    </Pressable>
  )
}
