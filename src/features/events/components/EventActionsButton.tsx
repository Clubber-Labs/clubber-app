import { useState } from 'react'
import { Pressable } from 'react-native'
import { DotsThreeIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { useConfirm } from '@/shared/lib/confirm'
import { useDeleteEvent } from '../hooks/useDeleteEvent'
import { ActionsMenu, type MenuAction } from '@/shared/components/ActionsMenu'
import { colors } from '@/shared/theme'

type Props = {
  eventId: string
}

export function EventActionsButton({ eventId }: Props) {
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

  const actions: MenuAction[] = [
    {
      label: t('events.actions.edit'),
      onPress: () => router.push(`/events/${eventId}/edit`),
    },
    // Convidar saiu do menu: virou ação de primeira classe no detalhe (linha
    // "Convidados" da divulgação, botão + no RSVP). Aqui fica a LISTA de quem
    // já foi convidado, que é do autor.
    {
      label: t('events.actions.invited'),
      onPress: () => router.push(`/events/${eventId}/invited`),
    },
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
      <ActionsMenu
        visible={open}
        actions={actions}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
