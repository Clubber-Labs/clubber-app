import { useState } from 'react'
import { Pressable } from 'react-native'
import { DotsThreeIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const confirm = useConfirm()
  const { mutate: deleteEvent } = useDeleteEvent(eventId)

  async function handleDelete() {
    const ok = await confirm({
      title: t('events.actions.deleteEvent'),
      message: t('events.actions.deleteMessage'),
      confirmLabel: t('common.delete'),
      destructive: true,
    })
    if (!ok) return
    deleteEvent(undefined, {
      onSuccess: () => router.back(),
    })
  }

  const actions: EventAction[] = [
    {
      label: t('events.actions.edit'),
      onPress: () => router.push(`/events/${eventId}/edit`),
    },
    ...(!isPublic
      ? [
          {
            label: t('events.actions.invite'),
            onPress: () => router.push(`/events/${eventId}/invites`),
          },
          {
            label: t('events.actions.invited'),
            onPress: () => router.push(`/events/${eventId}/invited`),
          },
        ]
      : []),
    {
      label: t('events.actions.deleteEvent'),
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
        <DotsThreeIcon size={22} color={colors.content} weight="bold" />
      </Pressable>
      <EventActionsMenu
        visible={open}
        actions={actions}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
