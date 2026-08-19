import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import {
  PencilSimpleIcon,
  SignOutIcon,
  UserPlusIcon,
} from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { useConfirm } from '@/shared/lib/confirm'
import { useBanner } from '@/shared/lib/banner'
import { getApiError } from '@/shared/lib/apiError'
import { ConversationAvatar } from './ConversationAvatar'
import { ParticipantRow } from './ParticipantRow'
import { ParticipantActionsSheet } from './ParticipantActionsSheet'
import { AddParticipantsModal } from './AddParticipantsModal'
import { GroupTitleModal } from './GroupTitleModal'
import { conversationAvatarUsers } from '../utils/conversationDisplay'
import {
  useAddParticipant,
  useLeaveGroup,
  useRemoveParticipant,
  useRenameGroup,
  useUpdateRole,
} from '../hooks/useGroupAdmin'
import type { Conversation, Participant } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  conversation: Conversation
  myId: string
  onLeft: () => void
}

export function GroupDetails({ conversation, myId, onLeft }: Props) {
  const { t } = useTranslation()
  const id = conversation.id
  const amAdmin =
    conversation.participants.find(p => p.userId === myId)?.role === 'ADMIN'

  const rename = useRenameGroup(id)
  const addParticipant = useAddParticipant(id)
  const removeParticipant = useRemoveParticipant(id)
  const updateRole = useUpdateRole(id)
  const leave = useLeaveGroup(id)
  const confirm = useConfirm()
  const showBanner = useBanner()

  const [renameOpen, setRenameOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [managed, setManaged] = useState<Participant | null>(null)

  const onError = (e: unknown) => showBanner(getApiError(e).message)

  async function handleLeave() {
    const ok = await confirm({
      title: t('chat.group.leave'),
      message: t('chat.group.leaveMessage'),
      confirmLabel: t('chat.group.leaveConfirm'),
      destructive: true,
    })
    if (ok) leave.mutate(undefined, { onSuccess: onLeft, onError })
  }

  async function handleRemove(p: Participant) {
    const ok = await confirm({
      title: t('chat.group.removeTitle'),
      message: t('chat.group.removeMessage', { name: p.user.name }),
      confirmLabel: t('chat.group.removeConfirm'),
      destructive: true,
    })
    if (ok) removeParticipant.mutate(p.userId, { onError })
  }

  function handleToggleAdmin(p: Participant) {
    updateRole.mutate(
      { userId: p.userId, role: p.role === 'ADMIN' ? 'MEMBER' : 'ADMIN' },
      { onError },
    )
  }

  return (
    <View>
      <View className="items-center pt-6 pb-4 gap-1.5">
        <ConversationAvatar
          users={conversationAvatarUsers(conversation, myId)}
          type="GROUP"
          size={88}
        />
        <View className="flex-row items-center gap-2 mt-2">
          <Text className="text-content font-bold text-xl">
            {conversation.title ?? t('chat.conversation.group')}
          </Text>
          {amAdmin && (
            <Pressable
              onPress={() => setRenameOpen(true)}
              accessibilityLabel={t('chat.group.rename')}
              className="p-1"
            >
              <PencilSimpleIcon
                size={16}
                color={colors.brandEmphasis}
                weight="fill"
              />
            </Pressable>
          )}
        </View>
        <Text className="text-content-subtle">
          {t('chat.group.participantCount', {
            count: conversation.participants.length,
          })}
        </Text>
      </View>

      <Text className="text-content-muted text-xs font-medium uppercase tracking-wider px-4 pt-3 pb-1">
        {t('chat.group.participants')}
      </Text>
      {conversation.participants.map(p => (
        <ParticipantRow
          key={p.userId}
          participant={p}
          isMe={p.userId === myId}
          canManage={amAdmin && p.userId !== myId}
          onManage={() => setManaged(p)}
        />
      ))}

      {amAdmin && (
        <Pressable
          onPress={() => setAddOpen(true)}
          className="flex-row items-center gap-3 px-4 py-3"
        >
          <View className="w-11 h-11 rounded-full bg-surface items-center justify-center">
            <UserPlusIcon
              size={20}
              color={colors.brandEmphasis}
              weight="fill"
            />
          </View>
          <Text className="text-brand-text text-base font-medium">
            {t('chat.group.addPeople')}
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={handleLeave}
        className="flex-row items-center gap-3 px-4 py-3.5 mt-3 border-t border-line-subtle"
      >
        <SignOutIcon size={22} color={colors.danger} />
        <Text className="text-danger text-base">{t('chat.group.leave')}</Text>
      </Pressable>

      <GroupTitleModal
        visible={renameOpen}
        onClose={() => setRenameOpen(false)}
        initialValue={conversation.title ?? ''}
        heading={t('chat.group.rename')}
        confirmLabel={t('common.save')}
        submitting={rename.isPending}
        onConfirm={title =>
          rename.mutate(title, {
            onSuccess: () => setRenameOpen(false),
            onError,
          })
        }
      />
      <AddParticipantsModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        existingIds={conversation.participants.map(p => p.userId)}
        onAdd={userId => addParticipant.mutate(userId, { onError })}
      />
      <ParticipantActionsSheet
        visible={!!managed}
        participant={managed}
        onClose={() => setManaged(null)}
        onToggleAdmin={() => managed && handleToggleAdmin(managed)}
        onRemove={() => managed && handleRemove(managed)}
      />
    </View>
  )
}
