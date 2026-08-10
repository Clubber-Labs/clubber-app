import { Pressable, View, Text, ActivityIndicator } from 'react-native'
import { CaretRightIcon, type Icon } from 'phosphor-react-native'
import { colors } from '@/shared/theme'

type Props = {
  icon: Icon
  label: string
  sublabel?: string
  onPress: () => void
  // Vermelho (ex.: cancelar) — tile e texto em tom de perigo.
  destructive?: boolean
  // Troca o chevron por spinner e bloqueia o toque enquanto a ação roda.
  loading?: boolean
}

// Linha de ação estilo "ajustes": tile de ícone + título/subtítulo + chevron.
// Compõe a lista de gerência do rolê (dono). Sem borda própria — quem agrupa
// (SpotOwnerActions) cuida do card e dos divisores.
export function SpotActionRow({
  icon: Icon,
  label,
  sublabel,
  onPress,
  destructive,
  loading,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      className="flex-row items-center gap-3 px-4 py-3.5"
    >
      <View
        className={`w-9 h-9 rounded-lg items-center justify-center ${
          destructive ? 'bg-danger/10' : 'bg-surface-elevated'
        }`}
      >
        <Icon
          size={18}
          color={destructive ? colors.dangerText : colors.contentSecondary}
        />
      </View>
      <View className="flex-1">
        <Text
          className={`text-[15px] font-semibold ${
            destructive ? 'text-danger-text' : 'text-content-secondary'
          }`}
        >
          {label}
        </Text>
        {sublabel && (
          <Text className="text-content-subtle text-xs mt-0.5">{sublabel}</Text>
        )}
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={colors.contentMuted} />
      ) : (
        <CaretRightIcon size={16} color={colors.contentFaint} />
      )}
    </Pressable>
  )
}
