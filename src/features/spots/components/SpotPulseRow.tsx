import { View, Text } from 'react-native'
import { Trans } from 'react-i18next'
import { ProfileLink } from '@/features/users/components/ProfileLink'
import { UserAvatar } from '@/shared/components/UserAvatar'
import type { Spot } from '../types'

type Props = {
  spot: Spot
  live: boolean
}

const AVATAR_SIZE = 36
const OVERLAP = -12
const MAX_AVATARS = 3
// Duas assinaturas bastam pra frase: a terceira já é ruído, e quem sobra está
// contado no "+N" da pilha.
const MAX_NAMES = 2

/**
 * Pulso social: quem já está no rolê, em fotos e em uma frase. É a primeira
 * linha do corpo porque num rolê a pergunta é "quem vai estar lá", não "o que
 * é" — o título vem depois.
 */
export function SpotPulseRow({ spot, live }: Props) {
  const members = spot.members?.length ? spot.members : [spot.creator]
  const visible = members.slice(0, MAX_AVATARS)
  const overflow = spot.memberCount - visible.length
  const bold = <Text className="font-bold text-content" />

  // Só o criador: não há pulso pra mostrar, e a linha vira a assinatura dele.
  if (spot.memberCount <= 1) {
    return (
      <ProfileLink
        userId={spot.creator.id}
        username={spot.creator.username}
        className="flex-row items-center gap-2.5"
      >
        <UserAvatar
          name={spot.creator.name}
          avatarUrl={spot.creator.avatarUrl}
          size={AVATAR_SIZE}
        />
        <Text className="flex-1 text-[13px] text-content-muted">
          <Trans
            i18nKey="spots.feedCard.pulseSolo"
            values={{ username: spot.creator.username }}
            components={{ b: bold }}
          />
        </Text>
      </ProfileLink>
    )
  }

  const names = members.slice(0, MAX_NAMES).map(member => member.name)

  return (
    <View className="flex-row items-center gap-2.5">
      <View className="flex-row">
        {visible.map((member, i) => (
          <View
            key={member.id}
            className="rounded-full border-2 border-surface"
            style={{ marginLeft: i === 0 ? 0 : OVERLAP }}
          >
            <ProfileLink userId={member.id} username={member.username}>
              <UserAvatar
                name={member.name}
                avatarUrl={member.avatarUrl}
                size={AVATAR_SIZE}
              />
            </ProfileLink>
          </View>
        ))}
        {overflow > 0 && (
          <View
            className="items-center justify-center rounded-full border-2 border-surface bg-surface-elevated"
            style={{
              marginLeft: OVERLAP,
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
            }}
          >
            <Text className="text-[11px] font-bold text-content-secondary">
              {`+${overflow}`}
            </Text>
          </View>
        )}
      </View>
      <Text className="flex-1 text-[13px] text-content-muted" numberOfLines={2}>
        {live ? (
          <Trans
            i18nKey="spots.feedCard.pulseLive"
            count={names.length}
            values={{ names: names.join(', ') }}
            components={{ b: bold }}
          />
        ) : (
          <Trans
            i18nKey="spots.feedCard.pulseGroup"
            count={spot.memberCount - 1}
            values={{ name: members[0].name }}
            components={{ b: bold }}
          />
        )}
      </Text>
    </View>
  )
}
