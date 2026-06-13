import { Pressable, View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import { colors } from '@/shared/theme'

type IconName = ComponentProps<typeof Ionicons>['name']

type Props = {
  label: string
  description?: string
  icon?: IconName
  destructive?: boolean
  onPress: () => void
}

// Linha de configuração genérica (label + descrição + chevron), no padrão das
// telas de perfil/privacidade. destructive deixa ícone/texto em vermelho.
export function SettingsRow({
  label,
  description,
  icon,
  destructive,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-4 border-b border-line active:opacity-70"
    >
      <View className="flex-row items-center gap-3 flex-1 pr-3">
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={destructive ? colors.danger : colors.contentMuted}
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
      <Ionicons name="chevron-forward" size={16} color={colors.contentSubtle} />
    </Pressable>
  )
}
