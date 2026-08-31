import type { ComponentType } from 'react'
import { View, Text, Pressable } from 'react-native'
import { CaretRightIcon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

/** Aceita phosphor e marcas próprias — basta size/color. */
type RowIcon = ComponentType<{ size?: number; color?: string }>

type Props = {
  icon: RowIcon
  label: string
  subtitle?: string
  // Selo à direita do rótulo (ex.: PREMIUM no promover).
  badge?: string
  onPress: () => void
  disabled?: boolean
  // Última da lista desliga a régua: a seção seguinte traz o próprio border-t,
  // e as duas a 20px de distância viram linha dupla.
  divider?: boolean
}

// Linha reta da seção de divulgação — estrutura, não superfície: sem raio, só
// a régua do border-b (mesma família do SettingsRow, com selo e sem padding
// horizontal, porque aqui a seção já vive na coluna da tela).
export function EventPromotionRow({
  icon: IconComponent,
  label,
  subtitle,
  badge,
  onPress,
  disabled,
  divider = true,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className={`flex-row items-center gap-3 py-3.5 active:opacity-70 ${
        divider ? 'border-b border-line' : ''
      }`}
    >
      <IconComponent size={20} color={colors.contentSecondary} />
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-content text-[15px] font-semibold">
            {label}
          </Text>
          {!!badge && (
            <View className="rounded-full border border-line-strong px-1.5 py-0.5">
              <Text className="text-content-muted text-[10px] font-bold tracking-wide">
                {badge}
              </Text>
            </View>
          )}
        </View>
        {!!subtitle && (
          <Text className="text-content-muted mt-0.5 text-xs" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      <CaretRightIcon size={16} color={colors.contentSubtle} />
    </Pressable>
  )
}
