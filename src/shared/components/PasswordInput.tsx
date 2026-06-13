import { useState } from 'react'
import { View, TextInput, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import { colors } from '@/shared/theme'

type Props = {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  error?: boolean
  autoFocus?: boolean
  textContentType?: ComponentProps<typeof TextInput>['textContentType']
  autoComplete?: ComponentProps<typeof TextInput>['autoComplete']
}

// Campo de senha com toggle de mostrar/ocultar (olho). Mesmo visual dos demais
// inputs dark; o ícone fica dentro da borda à direita.
export function PasswordInput({
  value,
  onChangeText,
  placeholder,
  error,
  autoFocus,
  textContentType,
  autoComplete,
}: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <View
      className={`flex-row items-center border ${error ? 'border-content' : 'border-line'} bg-surface rounded-xl pl-4 pr-3`}
    >
      <TextInput
        className="flex-1 py-3.5 text-base text-content"
        placeholder={placeholder}
        placeholderTextColor={colors.contentSubtle}
        onChangeText={onChangeText}
        value={value}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        textContentType={textContentType}
        autoComplete={autoComplete}
      />
      <Pressable
        onPress={() => setVisible(v => !v)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
      >
        <Ionicons
          name={visible ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color={colors.contentSubtle}
        />
      </Pressable>
    </View>
  )
}
