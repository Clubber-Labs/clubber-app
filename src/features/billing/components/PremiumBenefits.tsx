import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'

type IconName = ComponentProps<typeof Ionicons>['name']

type Benefit = {
  icon: IconName
  title: string
  description: string
}

const BENEFITS: Benefit[] = [
  {
    icon: 'star-outline',
    title: 'Destaque seus eventos',
    description: 'Seus eventos aparecem em destaque na descoberta e no mapa.',
  },
  {
    icon: 'trending-up-outline',
    title: 'Mais alcance',
    description: 'Prioridade no feed e na busca para o seu perfil e eventos.',
  },
  {
    icon: 'sparkles-outline',
    title: 'Selo premium',
    description: 'Identidade visual exclusiva no seu perfil.',
  },
]

export function PremiumBenefits() {
  return (
    <View className="gap-4">
      {BENEFITS.map(benefit => (
        <View key={benefit.title} className="flex-row items-start gap-3">
          <View className="w-10 h-10 rounded-full bg-violet-600/20 items-center justify-center">
            <Ionicons name={benefit.icon} size={20} color="#a78bfa" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold text-base">
              {benefit.title}
            </Text>
            <Text className="text-zinc-400 text-sm mt-0.5">
              {benefit.description}
            </Text>
          </View>
        </View>
      ))}
    </View>
  )
}
