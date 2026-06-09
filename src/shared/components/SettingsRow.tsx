import { Pressable, View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'

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
      className="flex-row items-center justify-between px-4 py-4 border-b border-zinc-800 active:opacity-70"
    >
      <View className="flex-row items-center gap-3 flex-1 pr-3">
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={destructive ? '#ef4444' : '#a1a1aa'}
          />
        )}
        <View className="flex-1">
          <Text
            className={`text-sm font-medium ${destructive ? 'text-red-400' : 'text-white'}`}
          >
            {label}
          </Text>
          {description && (
            <Text className="text-xs text-zinc-500 mt-0.5 leading-4">
              {description}
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#71717a" />
    </Pressable>
  )
}
