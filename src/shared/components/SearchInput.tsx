import { MagnifyingGlassIcon, XCircleIcon } from 'phosphor-react-native'
import { forwardRef } from 'react'
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native'
import { GlassSurface } from '@/shared/components/GlassSurface'
import { colors } from '@/shared/theme'

type Props = {
  value: string
  onChange: (text: string) => void
  loading?: boolean
  placeholder?: string
  // 'overlay' = sobreposto ao mapa: vidro (GlassSurface), mesmo sistema da tab
  // bar e dos controles. 'default' mantém a pílula escura das demais buscas.
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
    ? 'pl-10 pr-12 py-3 text-base text-content'
    : 'bg-background rounded-3xl pl-10 pr-12 py-3 text-base text-content'

  const input = (
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
  )

  return (
    <View className="relative">
      <View className="absolute left-3 top-0 bottom-0 justify-center items-center z-10">
        <MagnifyingGlassIcon
          size={18}
          color={overlay ? colors.contentSecondary : colors.content}
        />
      </View>
      {overlay ? (
        <GlassSurface style={{ borderRadius: 12 }}>{input}</GlassSurface>
      ) : (
        input
      )}
      <View className="absolute right-3 top-0 bottom-0 justify-center items-center">
        {loading ? (
          <ActivityIndicator size="small" color={colors.brandEmphasis} />
        ) : hasText ? (
          <Pressable
            onPress={() => onChange('')}
            hitSlop={10}
            accessibilityLabel="Limpar busca"
          >
            <XCircleIcon size={20} color={colors.contentSubtle} />
          </Pressable>
        ) : null}
      </View>
    </View>
  )
})
