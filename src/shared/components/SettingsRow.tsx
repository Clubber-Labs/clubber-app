import type { ComponentType } from 'react'
import { Pressable, View, Text } from 'react-native'
import { CaretRightIcon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

/** Aceita phosphor e marcas próprias (ex.: SpotifyMark) — basta size/color. */
type RowIcon = ComponentType<{ size?: number; color?: string }>

type Props = {
  label: string
  description?: string
  icon?: RowIcon
  /** Sobrepõe a cor padrão do ícone (ex.: marca de terceiro na cor oficial). */
  iconColor?: string
  destructive?: boolean
  onPress: () => void
}

// Linha de configuração genérica (label + descrição + chevron), no padrão das
// telas de perfil/privacidade. destructive deixa ícone/texto em vermelho.
export function SettingsRow({
  label,
  description,
  icon: IconComponent,
  iconColor,
  destructive,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-4 border-b border-line active:opacity-70"
    >
      <View className="flex-row items-center gap-3 flex-1 pr-3">
        {IconComponent && (
          <IconComponent
            size={20}
            color={
              iconColor ?? (destructive ? colors.danger : colors.contentMuted)
            }
          />
        )}
        <View className="flex-1">
          <Text
            className={`text-sm font-medium ${destructive ? 'text-danger-text' : 'text-content'}`}
          >
            {label}
          </Text>
          {description && (
            <Text className="text-xs text-content-subtle mt-0.5 leading-4">
              {description}
            </Text>
          )}
        </View>
      </View>
      <CaretRightIcon size={16} color={colors.contentSubtle} />
    </Pressable>
  )
}
