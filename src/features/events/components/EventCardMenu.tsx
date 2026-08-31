import { useState } from 'react'
import { Pressable } from 'react-native'
import { DotsThreeIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useConfirm } from '@/shared/lib/confirm'
import { useReportFlow } from '@/features/reports/hooks/useReportFlow'
import { ReportReasonSheet } from '@/features/reports/components/ReportReasonSheet'
import { REPORT_TITLE_KEYS } from '@/features/reports/utils/reportLabels'
import { useDeleteEvent } from '../hooks/useDeleteEvent'
import { ActionsMenu, type MenuAction } from '@/shared/components/ActionsMenu'
import { colors } from '@/shared/theme'

type Props = {
  eventId: string
  authorId: string
}

/**
 * ⋯ sobreposto na capa do card do feed — um gatilho só para os dois públicos:
 * o autor edita/exclui, quem passa denuncia. Difere do EventActionsButton do
 * detalhe, onde a tela já separa os papéis e o denunciar tem botão próprio.
 *
 * O delete não navega: o useDeleteEvent tira o evento do cache do feed no
 * onMutate, então o card sai da lista sozinho.
 */
export function EventCardMenu({ eventId, authorId }: Props) {
  const { t } = useTranslation()
  const router = useRouter()
  const confirm = useConfirm()
  const [open, setOpen] = useState(false)
  const viewerId = useAuthStore(state => state.userId)
  const { mutate: deleteEvent } = useDeleteEvent(eventId)
  const report = useReportFlow()

  const isAuthor = !!viewerId && viewerId === authorId

  async function handleDelete() {
    const ok = await confirm({
      title: t('events.actions.deleteEvent'),
      message: t('events.actions.deleteMessage'),
      confirmLabel: t('common.delete'),
      destructive: true,
    })
    if (ok) deleteEvent()
  }

  const actions: MenuAction[] = isAuthor
    ? [
        {
          label: t('events.actions.edit'),
          onPress: () => router.push(`/events/${eventId}/edit`),
        },
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
    : [
        {
          label: t(REPORT_TITLE_KEYS.event),
          onPress: () => report.requestReport({ type: 'event', id: eventId }),
        },
      ]

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('events.card.moreActions')}
        className="h-9 w-9 items-center justify-center rounded-full bg-background/50"
      >
        <DotsThreeIcon size={20} color={colors.content} weight="bold" />
      </Pressable>
      <ActionsMenu
        visible={open}
        actions={actions}
        onClose={() => setOpen(false)}
      />
      <ReportReasonSheet
        target={report.target}
        onClose={report.close}
        onSubmit={report.submit}
      />
    </>
  )
}
