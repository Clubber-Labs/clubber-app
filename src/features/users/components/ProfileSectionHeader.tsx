import type { ComponentProps } from 'react'
import { View, Text, Pressable } from 'react-native'
import type { Icon } from 'phosphor-react-native'
import Animated from 'react-native-reanimated'
import { colors } from '@/shared/theme'
import { SECTION_HEADER_HEIGHT } from '../utils/profileStage'

type Props = {
  title: string
  count?: number
  // Ação à direita (ex.: "Ver todas"). Some sem onAction.
  action?: string
  // Ícone antes do rótulo da ação (ex.: caret pra cima = "puxe").
  actionIcon?: Icon
  onAction?: () => void
  // Estilo animado da ação (fade dirigido pelo palco, sem re-render).
  actionStyle?: ComponentProps<typeof Animated.View>['style']
}

// Cabeçalho das seções do perfil (MURAL, EVENTOS). Altura fixa: a geometria do
// palco é calculada a partir dela — ver utils/profileStage.
export function ProfileSectionHeader({
  title,
  count,
  action,
  actionIcon: ActionIcon,
  onAction,
  actionStyle,
}: Props) {
  return (
    <View
      className="flex-row items-center px-4"
      style={{ height: SECTION_HEADER_HEIGHT }}
    >
      <View className="flex-1 flex-row items-baseline gap-2">
        <Text
          className="text-[15px] font-extrabold uppercase text-content"
          style={{ letterSpacing: 1 }}
        >
          {title}
        </Text>
        {count !== undefined && (
          <Text className="text-[13px] font-semibold text-content-subtle">
            {count}
          </Text>
        )}
      </View>
      {!!action && !!onAction && (
        <Animated.View style={[{ height: '100%' }, actionStyle]}>
          <Pressable
            onPress={onAction}
            hitSlop={8}
            accessibilityRole="button"
            className="h-full flex-row items-center gap-1"
          >
            {ActionIcon && (
              <ActionIcon size={12} weight="bold" color={colors.contentMuted} />
            )}
            <Text className="text-xs font-bold text-content-muted">
              {action}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  )
}
