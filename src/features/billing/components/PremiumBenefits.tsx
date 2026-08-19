import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  RocketIcon,
  ChartBarIcon,
  TrendUpIcon,
  SparkleIcon,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

// Chaves, não frases: a constante avalia no import e congelaria o idioma.
type BenefitKind = 'featured' | 'analytics' | 'reach' | 'badge'

type Benefit = {
  icon: Icon
  titleKey: `billing.benefits.${BenefitKind}.title`
  descriptionKey: `billing.benefits.${BenefitKind}.description`
}

const BENEFITS: Benefit[] = [
  {
    icon: RocketIcon,
    titleKey: 'billing.benefits.featured.title',
    descriptionKey: 'billing.benefits.featured.description',
  },
  {
    icon: ChartBarIcon,
    titleKey: 'billing.benefits.analytics.title',
    descriptionKey: 'billing.benefits.analytics.description',
  },
  {
    icon: TrendUpIcon,
    titleKey: 'billing.benefits.reach.title',
    descriptionKey: 'billing.benefits.reach.description',
  },
  {
    icon: SparkleIcon,
    titleKey: 'billing.benefits.badge.title',
    descriptionKey: 'billing.benefits.badge.description',
  },
]

export function PremiumBenefits() {
  const { t } = useTranslation()
  return (
    <View className="gap-4">
      {BENEFITS.map(benefit => (
        <View key={benefit.titleKey} className="flex-row items-start gap-3.5">
          <View className="w-10 h-10 rounded-full bg-brand/20 items-center justify-center">
            <benefit.icon size={20} color={colors.brandText} />
          </View>
          <View className="flex-1">
            <Text className="text-content font-semibold text-base">
              {t(benefit.titleKey)}
            </Text>
            <Text className="text-content-muted text-sm mt-0.5 leading-5">
              {t(benefit.descriptionKey)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  )
}
