import type { ReactNode } from 'react'
import { View, Text } from 'react-native'
import { EnvelopeOpenIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { ProfileLink } from '@/features/users/components/ProfileLink'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { useLocale } from '@/shared/hooks/useLocale'
import { formatRelative } from '@/shared/utils/dateFormat'
import { formatFullName } from '@/shared/utils/fullName'
import type { EventInviteContext } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  invite: EventInviteContext
  // O RSVP mora DENTRO do convite pra quem chegou por ele: a resposta é ao
  // convite, não ao evento solto.
  children?: ReactNode
}

export function EventInviteCard({ invite, children }: Props) {
  const { t } = useTranslation()
  const locale = useLocale()
  const inviterName = formatFullName(
    invite.inviter.name,
    invite.inviter.lastname,
  )
  const others = invite.others ?? []
  const othersTotal = invite.othersCount ?? others.length

  const when = formatRelative(invite.createdAt, locale)
  const alongside =
    others.length === 0 || othersTotal === 0
      ? null
      : othersTotal > 1
        ? t('events.detail.invite.withOthers', {
            name: others[0].name,
            count: othersTotal - 1,
          })
        : t('events.detail.invite.withOne', { name: others[0].name })

  return (
    <View className="gap-4 rounded-2xl border border-line-strong bg-surface p-4">
      <View className="flex-row items-center gap-3">
        <ProfileLink
          userId={invite.inviter.id}
          username={invite.inviter.username}
        >
          <UserAvatar
            name={inviterName}
            avatarUrl={invite.inviter.avatarUrl}
            size={48}
          />
        </ProfileLink>
        <View className="flex-1">
          <Text className="text-content text-base font-bold" numberOfLines={1}>
            {t('events.detail.invite.title', {
              name: invite.inviter.name,
            })}
          </Text>
          <Text className="text-content-muted text-xs" numberOfLines={1}>
            {alongside ? `${when} · ${alongside}` : when}
          </Text>
        </View>
        <EnvelopeOpenIcon size={22} color={colors.contentMuted} />
      </View>
      {children}
    </View>
  )
}
