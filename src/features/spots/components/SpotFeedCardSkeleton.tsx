import { View } from 'react-native'
import { SPOT_FEED_MAP_HEIGHT } from './SpotFeedMap'

/**
 * Fantasma do SpotFeedCard, na mesma anatomia: mapa como capa, linha do pulso
 * (pilha de avatares + frase), título com meta e o botão do chat. Mudou o
 * desenho do card? Este espelho precisa acompanhar.
 */
export function SpotFeedCardSkeleton() {
  return (
    <View className="mb-10 overflow-hidden rounded-xl bg-surface">
      <View
        className="bg-surface-elevated"
        style={{ height: SPOT_FEED_MAP_HEIGHT }}
      />

      <View className="gap-3 p-3">
        <View className="flex-row items-center gap-2.5">
          <View className="flex-row">
            <View className="h-7 w-7 rounded-full bg-surface-elevated" />
            <View className="-ml-2 h-7 w-7 rounded-full border-2 border-surface bg-surface-elevated" />
            <View className="-ml-2 h-7 w-7 rounded-full border-2 border-surface bg-surface-elevated" />
          </View>
          <View className="h-3 flex-1 rounded bg-surface-elevated" />
        </View>
        <View className="gap-2">
          <View className="h-5 w-3/4 rounded bg-surface-elevated" />
          <View className="h-3 w-1/2 rounded bg-surface-elevated" />
        </View>
      </View>

      <View className="px-3 pb-3">
        <View className="h-12 rounded-full bg-surface-elevated" />
      </View>
    </View>
  )
}
