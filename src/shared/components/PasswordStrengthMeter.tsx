import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import {
  evaluatePasswordStrength,
  type PasswordChecks,
} from '@/shared/utils/passwordStrength'
import { colors } from '@/shared/theme'

type Props = {
  password: string
  email?: string
}

const REQUIREMENTS: { key: keyof PasswordChecks; label: string }[] = [
  { key: 'length', label: '8+ caracteres' },
  { key: 'lettersAndNumbers', label: 'Letras e números' },
  { key: 'notObvious', label: 'Evite senhas óbvias' },
]

export function PasswordStrengthMeter({ password, email }: Props) {
  if (password.length === 0) return null

  const { score, label, checks } = evaluatePasswordStrength(password, email)
  const barColor =
    label === 'fraca'
      ? 'bg-danger'
      : label === 'média'
        ? 'bg-warning'
        : 'bg-success'
  const labelColor =
    label === 'fraca'
      ? 'text-danger-text'
      : label === 'média'
        ? 'text-warning'
        : 'text-success-text'

  return (
    <View className="gap-2">
      <View className="flex-row gap-1">
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            className={`h-1 flex-1 rounded-full ${i < score ? barColor : 'bg-surface-elevated'}`}
          />
        ))}
      </View>

      <View className="flex-row justify-between">
        <Text className="text-xs text-content-subtle">Força da senha</Text>
        <Text className={`text-xs font-medium ${labelColor}`}>{label}</Text>
      </View>

      <View className="gap-1 mt-1">
        {REQUIREMENTS.map(({ key, label: text }) => {
          const ok = checks[key]
          return (
            <View key={key} className="flex-row items-center gap-2">
              <Ionicons
                name={ok ? 'checkmark-circle' : 'ellipse-outline'}
                size={14}
                color={ok ? colors.success : colors.contentFaint}
              />
              <Text
                className={`text-xs ${ok ? 'text-content-tertiary' : 'text-content-subtle'}`}
              >
                {text}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
