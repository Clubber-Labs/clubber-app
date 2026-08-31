import { View } from 'react-native'
import { PHOTO_RATIO } from './EventCardHero'

/**
 * Fantasma do EventCard, na mesma anatomia do pôster com canhoto: capa 4:5 com
 * assinatura no topo e título embaixo, canhoto de data + RSVP, linha de ações.
 * Mudou o desenho do card? Este espelho precisa acompanhar.
 */
export function EventCardSkeleton() {
  return (
    <View className="mb-10 overflow-hidden rounded-xl bg-surface">
      <View
        className="justify-between p-3"
        style={{ aspectRatio: PHOTO_RATIO }}
      >
        <View className="flex-row items-center gap-2">
          <View className="h-8 w-8 rounded-full bg-surface-elevated" />
          <View className="h-3 w-28 rounded bg-surface-elevated" />
        </View>
        <View className="gap-2">
          <View className="h-7 w-4/5 rounded bg-surface-elevated" />
          <View className="h-7 w-3/5 rounded bg-surface-elevated" />
          <View className="flex-row gap-1.5 pt-1">
            <View className="h-6 w-24 rounded-full bg-surface-elevated" />
            <View className="h-6 w-16 rounded-full bg-surface-elevated" />
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between border-t border-line px-4 py-3">
        <View className="gap-2">
          <View className="h-2.5 w-16 rounded bg-surface-elevated" />
          <View className="h-7 w-24 rounded bg-surface-elevated" />
        </View>
        <View className="flex-row gap-2">
          <View className="h-10 w-24 rounded-full bg-surface-elevated" />
          <View className="h-10 w-24 rounded-full bg-surface-elevated" />
        </View>
      </View>

      <View className="flex-row items-center gap-4 border-t border-line px-4 py-3">
        <View className="h-5 w-10 rounded bg-surface-elevated" />
        <View className="h-5 w-10 rounded bg-surface-elevated" />
      </View>
    </View>
  )
}
