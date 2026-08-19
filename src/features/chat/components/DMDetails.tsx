import { View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ProhibitIcon, UserIcon } from 'phosphor-react-native'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { useConfirm } from '@/shared/lib/confirm'
import { useBanner } from '@/shared/lib/banner'
import { getApiError } from '@/shared/lib/apiError'
import { useBlocks, useBlockUser, useUnblockUser } from '../hooks/useBlocks'
import type { Conversation } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  conversation: Conversation
  myId: string
  onViewProfile: (userId: string) => void
}

export function DMDetails({ conversation, myId, onViewProfile }: Props) {
  const { t } = useTranslation()
  const other = conversation.participants.find(p => p.userId !== myId)?.user
  const { blocks } = useBlocks()
  const block = useBlockUser()
  const unblock = useUnblockUser()
  const confirm = useConfirm()
  const showBanner = useBanner()

  if (!other) return null

  const isBlocked = blocks.some(b => b.blocked.id === other.id)

  async function toggleBlock() {
    if (!other) return
    if (isBlocked) {
      unblock.mutate(other.id, {
        onError: e => showBanner(getApiError(e).message),
      })
      return
    }
    const ok = await confirm({
      title: t('chat.dm.block'),
      message: t('chat.dm.blockMessage', { name: other.name }),
      confirmLabel: t('chat.dm.blockConfirm'),
      destructive: true,
    })
    if (ok)
      block.mutate(other.id, {
        onError: e => showBanner(getApiError(e).message),
      })
  }

  return (
    <View className="px-4">
      <View className="items-center pt-6 pb-4 gap-1.5">
        <UserAvatar name={other.name} avatarUrl={other.avatarUrl} size={88} />
        <Text className="text-content font-bold text-xl mt-2">
          {other.name} {other.lastname}
        </Text>
        <Text className="text-content-subtle">@{other.username}</Text>
      </View>

      <Pressable
        onPress={() => onViewProfile(other.id)}
        className="flex-row items-center gap-3 py-3.5 border-t border-line-subtle"
      >
        <UserIcon size={22} color={colors.contentSecondary} />
        <Text className="text-content-bright text-base">
          {t('chat.dm.viewProfile')}
        </Text>
      </Pressable>

      <Pressable
        onPress={toggleBlock}
        className="flex-row items-center gap-3 py-3.5 border-t border-line-subtle"
      >
        <ProhibitIcon size={22} color={colors.danger} />
        <Text className="text-danger text-base">
          {isBlocked ? t('chat.dm.unblock') : t('chat.dm.block')}
        </Text>
      </Pressable>
    </View>
  )
}
