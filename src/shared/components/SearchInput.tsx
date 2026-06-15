import { Ionicons } from '@expo/vector-icons'
import { forwardRef } from 'react'
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native'
import { colors } from '@/shared/theme'

type Props = {
  value: string
  onChange: (text: string) => void
  loading?: boolean
  placeholder?: string
  // 'overlay' = sobreposto ao mapa: superfície translúcida, cantos do sistema e
  // borda. 'default' mantém a pílula escura usada nas demais buscas.
  variant?: 'default' | 'overlay'
}

// Input de busca genérico (ícone + clear + loading), dark theme. Reusável por
// qualquer busca (pessoas, eventos…). Sem padding externo — o caller posiciona.
export const SearchInput = forwardRef<TextInput, Props>(function SearchInput(
  { value, onChange, loading, placeholder = 'Buscar...', variant = 'default' },
  ref,
) {
  const hasText = value.length > 0
  const overlay = variant === 'overlay'
  const fieldClass = overlay
    ? 'bg-surface/95 border border-line-strong rounded-xl pl-10 pr-12 py-3 text-base text-content'
    : 'bg-background rounded-3xl pl-10 pr-12 py-3 text-base text-content'

  return (
    <View className="relative">
      <View className="absolute left-3 top-0 bottom-0 justify-center items-center z-10">
        <Ionicons
          name="search"
          size={18}
          color={overlay ? colors.contentSecondary : colors.content}
        />
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={overlay ? colors.contentMuted : colors.content}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        textAlignVertical="center"
        className={fieldClass}
      />
      <View className="absolute right-3 top-0 bottom-0 justify-center items-center">
        {loading ? (
          <ActivityIndicator size="small" color={colors.brandEmphasis} />
        ) : hasText ? (
          <Pressable
            onPress={() => onChange('')}
            hitSlop={10}
            accessibilityLabel="Limpar busca"
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.contentSubtle}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  )
})
