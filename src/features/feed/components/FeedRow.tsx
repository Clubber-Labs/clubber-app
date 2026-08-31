import { memo } from 'react'
import { EventCard } from '@/features/events/components/EventCard'
import { SpotFeedCard } from '@/features/spots/components/SpotFeedCard'
import type { FeedItem } from '../types'

type Props = {
  item: FeedItem
  userCoords: [number, number] | null
  onOpenEvent: (id: string) => void
}

/**
 * Linha do feed, memoizada. Uma troca de aba re-renderiza o FeedList várias
 * vezes — o kind muda, isLoading sobe, os dados chegam, isLoading desce — e sem
 * isto cada passada dessas re-renderizava TODO card montado, que é de longe a
 * árvore mais cara da tela.
 *
 * O memo só vale porque as três props são estáveis: `item` vem do cache do
 * react-query, `userCoords` é state, e `onOpenEvent` é useCallback. Passar o
 * `onPress` inline aqui de fora anularia tudo.
 */
export const FeedRow = memo(function FeedRow({
  item,
  userCoords,
  onOpenEvent,
}: Props) {
  if (item.type === 'SPOT') {
    return <SpotFeedCard spot={item} userCoords={userCoords} />
  }
  return (
    <EventCard
      event={item}
      onPress={() => onOpenEvent(item.id)}
      // A tela é dona da localização: o useUserLocation monta estado e listener
      // de AppState próprios a cada chamada, então um por card sairia caro.
      userCoords={userCoords}
    />
  )
})
