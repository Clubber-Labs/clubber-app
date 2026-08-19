import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  CalendarBlankIcon,
  LockIcon,
  PlusIcon,
  type Icon,
} from 'phosphor-react-native'
import { colors } from '@/shared/theme'

type Variant = 'own' | 'other' | 'private'

// Chaves, não frases: a constante avalia no import e congelaria o idioma.
const CONTENT = {
  own: {
    icon: CalendarBlankIcon,
    titleKey: 'profile.empty.ownTitle',
    messageKey: 'profile.empty.ownMessage',
  },
  other: {
    icon: CalendarBlankIcon,
    titleKey: 'profile.empty.otherTitle',
    messageKey: 'profile.empty.otherMessage',
  },
  private: {
    icon: LockIcon,
    titleKey: 'profile.empty.privateTitle',
    messageKey: 'profile.empty.privateMessage',
  },
} as const satisfies Record<
  Variant,
  { icon: Icon; titleKey: string; messageKey: string }
>

type Props = {
  variant: Variant
  // Só usado na variante 'own' — abre o fluxo de criar evento.
  onCreate?: () => void
}

export function ProfileEventsEmpty({ variant, onCreate }: Props) {
  const { t } = useTranslation()
  const content = CONTENT[variant]
  return (
    <View className="items-center px-8 pb-8 pt-14">
      <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-surface">
        <content.icon size={26} color={colors.contentSubtle} />
      </View>
      <Text className="text-content text-base font-bold">
        {t(content.titleKey)}
      </Text>
      <Text className="text-content-muted mt-1 max-w-[260px] text-center text-sm leading-5">
        {t(content.messageKey)}
      </Text>
      {variant === 'own' && onCreate && (
        <Pressable
          onPress={onCreate}
          accessibilityRole="button"
          className="mt-5 flex-row items-center gap-1.5 rounded-lg bg-brand px-5 py-3"
        >
          <PlusIcon size={18} color={colors.content} />
          <Text className="text-content text-sm font-bold">
            {t('profile.empty.createEvent')}
          </Text>
        </Pressable>
      )}
    </View>
  )
}
