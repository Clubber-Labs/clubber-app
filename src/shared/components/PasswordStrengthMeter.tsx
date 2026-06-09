import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import {
  evaluatePasswordStrength,
  type PasswordChecks,
} from '@/shared/utils/passwordStrength'

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
      ? 'bg-red-500'
      : label === 'média'
        ? 'bg-yellow-500'
        : 'bg-green-500'
  const labelColor =
    label === 'fraca'
      ? 'text-red-400'
      : label === 'média'
        ? 'text-yellow-400'
        : 'text-green-400'

  return (
    <View className="gap-2">
      <View className="flex-row gap-1">
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            className={`h-1 flex-1 rounded-full ${i < score ? barColor : 'bg-zinc-800'}`}
          />
        ))}
      </View>

      <View className="flex-row justify-between">
        <Text className="text-xs text-zinc-500">Força da senha</Text>
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
                color={ok ? '#22c55e' : '#52525b'}
              />
              <Text
                className={`text-xs ${ok ? 'text-zinc-300' : 'text-zinc-500'}`}
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
