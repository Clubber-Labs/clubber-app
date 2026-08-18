import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CheckCircleIcon, CircleIcon } from 'phosphor-react-native'
import {
  evaluatePasswordStrength,
  type PasswordChecks,
  type PasswordLevel,
} from '@/shared/utils/passwordStrength'
import { colors } from '@/shared/theme'

type Props = {
  password: string
  email?: string
}

const REQUIREMENTS: {
  key: keyof PasswordChecks
  label: `shared.passwordStrength.${'length' | 'lettersAndNumbers' | 'notObvious'}`
}[] = [
  { key: 'length', label: 'shared.passwordStrength.length' },
  {
    key: 'lettersAndNumbers',
    label: 'shared.passwordStrength.lettersAndNumbers',
  },
  { key: 'notObvious', label: 'shared.passwordStrength.notObvious' },
]

const BAR_COLOR: Record<PasswordLevel, string> = {
  weak: 'bg-danger',
  medium: 'bg-warning',
  strong: 'bg-success',
}

const LABEL_COLOR: Record<PasswordLevel, string> = {
  weak: 'text-danger-text',
  medium: 'text-warning',
  strong: 'text-success-text',
}

export function PasswordStrengthMeter({ password, email }: Props) {
  const { t } = useTranslation()

  if (password.length === 0) return null

  const { score, level, checks } = evaluatePasswordStrength(password, email)

  return (
    <View className="gap-2">
      <View className="flex-row gap-1">
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            className={`h-1 flex-1 rounded-full ${i < score ? BAR_COLOR[level] : 'bg-surface-elevated'}`}
          />
        ))}
      </View>

      <View className="flex-row justify-between">
        <Text className="text-xs text-content-subtle">
          {t('shared.passwordStrength.title')}
        </Text>
        <Text className={`text-xs font-medium ${LABEL_COLOR[level]}`}>
          {t(`shared.passwordStrength.${level}`)}
        </Text>
      </View>

      <View className="gap-1 mt-1">
        {REQUIREMENTS.map(({ key, label }) => {
          const ok = checks[key]
          return (
            <View key={key} className="flex-row items-center gap-2">
              {ok ? (
                <CheckCircleIcon
                  size={14}
                  color={colors.success}
                  weight="fill"
                />
              ) : (
                <CircleIcon size={14} color={colors.contentFaint} />
              )}
              <Text
                className={`text-xs ${ok ? 'text-content-tertiary' : 'text-content-subtle'}`}
              >
                {t(label)}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
