import { forwardRef } from 'react'
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

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
      <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
        <Ionicons name="search" size={18} color="#71717a" />
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#71717a"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        className="bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-12 py-3 text-base text-white"
      />
      <View className="absolute right-3 top-0 bottom-0 justify-center">
        {loading ? (
          <ActivityIndicator size="small" color="#8b5cf6" />
        ) : hasText ? (
          <Pressable
            onPress={() => onChange('')}
            hitSlop={10}
            accessibilityLabel="Limpar busca"
          >
            <Ionicons name="close-circle" size={20} color="#71717a" />
          </Pressable>
        ) : null}
      </View>
    </View>
  )
})
