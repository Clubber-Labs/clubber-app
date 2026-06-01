import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
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

type Props = {
  conversation: Conversation
  myId: string
  onLeft: () => void
}

export function GroupDetails({ conversation, myId, onLeft }: Props) {
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
      title: 'Sair do grupo',
      message: 'Você deixará de receber as mensagens deste grupo.',
      confirmLabel: 'Sair',
      destructive: true,
    })
    if (ok) leave.mutate(undefined, { onSuccess: onLeft, onError })
  }

  async function handleRemove(p: Participant) {
    const ok = await confirm({
      title: 'Remover do grupo',
      message: `Remover ${p.user.name} do grupo?`,
      confirmLabel: 'Remover',
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
          <Text className="text-white font-bold text-xl">
            {conversation.title ?? 'Grupo'}
          </Text>
          {amAdmin && (
            <Pressable
              onPress={() => setRenameOpen(true)}
              accessibilityLabel="Renomear grupo"
              className="p-1"
            >
              <Ionicons name="pencil" size={16} color="#8b5cf6" />
            </Pressable>
          )}
        </View>
        <Text className="text-zinc-500">
          {conversation.participants.length} participantes
        </Text>
      </View>

      <Text className="text-zinc-400 text-xs font-medium uppercase tracking-wider px-4 pt-3 pb-1">
        Participantes
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
          <View className="w-11 h-11 rounded-full bg-zinc-900 items-center justify-center">
            <Ionicons name="person-add" size={20} color="#8b5cf6" />
          </View>
          <Text className="text-violet-400 text-base font-medium">
            Adicionar pessoas
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={handleLeave}
        className="flex-row items-center gap-3 px-4 py-3.5 mt-3 border-t border-zinc-900"
      >
        <Ionicons name="exit-outline" size={22} color="#ef4444" />
        <Text className="text-red-500 text-base">Sair do grupo</Text>
      </Pressable>

      <GroupTitleModal
        visible={renameOpen}
        onClose={() => setRenameOpen(false)}
        initialValue={conversation.title ?? ''}
        heading="Renomear grupo"
        confirmLabel="Salvar"
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
