import { View, Text, Pressable } from 'react-native'
import type { AggregatedReaction } from '../utils/reactions'

type Props = {
  reactions: AggregatedReaction[]
  // Alinha os chips ao lado da bolha (minha → direita; outra → esquerda).
  isMine: boolean
  onToggle: (emoji: string) => void
}

// Chips de reação agregados sob a bolha. A minha reação fica destacada (violeta);
// tocar num chip faz toggle (remove a minha / troca pela nova).
export function MessageReactions({ reactions, isMine, onToggle }: Props) {
  if (reactions.length === 0) return null
  return (
    <View
      className={`flex-row flex-wrap gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}
    >
      {reactions.map(({ emoji, count, mine }) => (
        <Pressable
          key={emoji}
          onPress={() => onToggle(emoji)}
          className={`flex-row items-center gap-1 rounded-full px-2 py-0.5 border ${
            mine
              ? 'bg-violet-600/30 border-violet-500'
              : 'bg-zinc-800 border-zinc-700'
          }`}
          accessibilityLabel={`${emoji} ${count}${mine ? ', sua reação' : ''}`}
        >
          <Text className="text-[13px]">{emoji}</Text>
          <Text
            className={`text-[12px] font-medium ${mine ? 'text-violet-200' : 'text-zinc-300'}`}
          >
            {count}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}
