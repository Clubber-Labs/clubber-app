import { forwardRef } from 'react'
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/shared/theme'

type Props = {
  value: string
  onChange: (text: string) => void
  loading?: boolean
  placeholder?: string
}

export const UserSearchInput = forwardRef<TextInput, Props>(
  function UserSearchInput(
    { value, onChange, loading, placeholder = 'Buscar pessoas...' },
    ref,
  ) {
    const hasText = value.length > 0

    return (
      <View className="px-4 pt-3 pb-2">
        <View className="relative">
          <View className="absolute left-3 top-0 bottom-0 justify-center">
            <Ionicons name="search" size={18} color={colors.contentSubtle} />
          </View>
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={colors.contentSubtle}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            className="bg-surface border border-line rounded-xl px-4 py-3 text-base text-content"
          />
          <View className="absolute right-3 top-0 bottom-0 justify-center">
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
      </View>
    )
  },
)
