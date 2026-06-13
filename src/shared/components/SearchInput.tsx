import { Ionicons } from '@expo/vector-icons'
import { forwardRef } from 'react'
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native'
import { colors } from '@/shared/theme'

type Props = {
  value: string
  onChange: (text: string) => void
  loading?: boolean
  placeholder?: string
}

// Input de busca genérico (ícone + clear + loading), dark theme. Reusável por
// qualquer busca (pessoas, eventos…). Sem padding externo — o caller posiciona.
export const SearchInput = forwardRef<TextInput, Props>(function SearchInput(
  { value, onChange, loading, placeholder = 'Buscar...' },
  ref,
) {
  const hasText = value.length > 0

  return (
    <View className="relative">
      <View className="absolute left-3 top-0 bottom-0 justify-center items-center z-10">
        <Ionicons name="search" size={18} color={colors.content} />
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.content}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        textAlignVertical="center"
        className="bg-background rounded-3xl pl-10 pr-12 py-3 text-base text-content"
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
