import { Pressable, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { UserPlusIcon } from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import { colors } from '@/shared/theme'

type Props = {
  eventId: string
}

// Convite é ação de primeira classe do detalhe (decisão de UX: não vive
// escondido no menu "..."). Mesma família visual dos cards de RSVP, de quem é
// vizinho de bloco.
export function EventInviteButton({ eventId }: Props) {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <Pressable
      onPress={() => router.push(`/events/${eventId}/invites`)}
      accessibilityRole="button"
      className="flex-row items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface py-3"
    >
      <UserPlusIcon size={20} color={colors.contentSecondary} />
      <Text className="text-xs font-bold text-content-secondary">
        {t('events.invites.cta')}
      </Text>
    </Pressable>
  )
}
