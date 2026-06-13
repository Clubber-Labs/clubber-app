import { useState } from 'react'
import { Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useConfirm } from '@/shared/lib/confirm'
import { useDeleteEvent } from '../hooks/useDeleteEvent'
import { EventActionsMenu, type EventAction } from './EventActionsMenu'
import { colors } from '@/shared/theme'

type Props = {
  eventId: string
  isPublic: boolean
}

export function EventActionsButton({ eventId, isPublic }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const confirm = useConfirm()
  const { mutate: deleteEvent } = useDeleteEvent(eventId)

  async function handleDelete() {
    const ok = await confirm({
      title: 'Excluir evento',
      message:
        'Tem certeza? Esta ação remove o evento e todas as interações associadas.',
      confirmLabel: 'Excluir',
      destructive: true,
    })
    if (!ok) return
    deleteEvent(undefined, {
      onSuccess: () => router.back(),
    })
  }

  const actions: EventAction[] = [
    {
      label: 'Editar',
      onPress: () => router.push(`/events/${eventId}/edit`),
    },
    ...(!isPublic
      ? [
          {
            label: 'Convidar',
            onPress: () => router.push(`/events/${eventId}/invites`),
          },
          {
            label: 'Convidados',
            onPress: () => router.push(`/events/${eventId}/invited`),
          },
        ]
      : []),
    {
      label: 'Excluir evento',
      onPress: handleDelete,
      destructive: true,
    },
  ]

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="w-10 h-10 items-center justify-center rounded-full bg-background/50"
        hitSlop={8}
      >
        <Ionicons name="ellipsis-horizontal" size={22} color={colors.content} />
      </Pressable>
      <EventActionsMenu
        visible={open}
        actions={actions}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
