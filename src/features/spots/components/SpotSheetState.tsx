import { View, Text } from 'react-native'
import type { Icon } from 'phosphor-react-native'
import type { ReactNode } from 'react'
import { colors } from '@/shared/theme'

type Props = {
  icon: Icon
  // brand = violeta (info/ação); warning = âmbar (limite/atenção).
  tone?: 'brand' | 'warning'
  title: string
  description: string
  children?: ReactNode
}

// Estado centrado da folha de sugestões (sem localização, vazio, cota): ícone em
// tile, título e texto centrados, e as ações específicas como children. Mantém
// os três caminhos infelizes com a mesma linguagem visual.
export function SpotSheetState({
  icon: Icon,
  tone = 'brand',
  title,
  description,
  children,
}: Props) {
  const tile =
    tone === 'warning'
      ? 'bg-warning/15 border-warning/30'
      : 'bg-brand-surface border-brand-surface-strong'
  const iconColor = tone === 'warning' ? colors.warningText : colors.brandText

  return (
    <View className="items-center gap-3 px-2 pt-4 pb-2">
      <View
        className={`w-16 h-16 rounded-2xl border items-center justify-center ${tile}`}
      >
        <Icon size={28} color={iconColor} />
      </View>
      <Text className="text-content text-lg font-bold text-center">
        {title}
      </Text>
      <Text className="text-content-muted text-sm text-center">
        {description}
      </Text>
      {children}
    </View>
  )
}
