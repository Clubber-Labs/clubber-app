import { View, Text } from 'react-native'
import { MapPinIcon } from 'phosphor-react-native'
import { SpotHighlights } from './SpotHighlights'
import type { SpotSuggestion } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  candidate: SpotSuggestion
}

// Referência do lugar no topo do form de publicação: título e descrição do rolê
// são escritos do zero pelo usuário, então este card é o que mantém à vista qual
// estabelecimento ele escolheu no painel de sugestões.
export function SpotCandidateCard({ candidate }: Props) {
  const { about, highlights } = candidate

  return (
    <View className="bg-surface border border-line rounded-2xl p-3 gap-3">
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-lg bg-brand-surface border border-brand-surface-strong items-center justify-center">
          <MapPinIcon weight="fill" size={20} color={colors.brandText} />
        </View>
        <View className="flex-1">
          <Text
            className="text-content text-base font-semibold"
            numberOfLines={1}
          >
            {candidate.name}
          </Text>
          {candidate.address && (
            <Text className="text-content-subtle text-xs" numberOfLines={1}>
              {candidate.address}
            </Text>
          )}
        </View>
      </View>
      {about && (
        <Text className="text-content-muted text-[13px] leading-snug">
          {about}
        </Text>
      )}
      <SpotHighlights items={highlights} />
    </View>
  )
}
