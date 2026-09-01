import { View, Text, Pressable } from 'react-native'
import { SECTION_HEADER_HEIGHT } from '../utils/profileStage'

type Props = {
  title: string
  count?: number
  // Ação à direita (ex.: "Ver todas"). Some sem onAction.
  action?: string
  onAction?: () => void
}

// Cabeçalho das seções do perfil (MURAL, EVENTOS). Altura fixa: a geometria do
// palco é calculada a partir dela — ver utils/profileStage.
export function ProfileSectionHeader({
  title,
  count,
  action,
  onAction,
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
        <Pressable
          onPress={onAction}
          hitSlop={8}
          accessibilityRole="button"
          className="h-full justify-center"
        >
          <Text className="text-xs font-bold text-content-muted">{action}</Text>
        </Pressable>
      )}
    </View>
  )
}
