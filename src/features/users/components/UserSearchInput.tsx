import { forwardRef } from 'react'
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  value: string
  onChange: (text: string) => void
  loading?: boolean
  placeholder?: string
}

export const UserSearchInput = forwardRef<TextInput, Props>(function UserSearchInput(
  { value, onChange, loading, placeholder = 'Buscar pessoas...' },
  ref,
) {
  const hasText = value.length > 0

  return (
    <View className="px-4 pt-3 pb-2">
      <View className="relative">
        <View className="absolute left-3 top-0 bottom-0 justify-center">
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
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-base text-white"
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
    </View>
  )
})
