import { useState } from 'react'
import { Pressable } from 'react-native'
import { DotsThreeIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { ActionsMenu, type MenuAction } from '@/shared/components/ActionsMenu'
import { useConfirm } from '@/shared/lib/confirm'
import { useReportFlow } from '@/features/reports/hooks/useReportFlow'
import { ReportReasonSheet } from '@/features/reports/components/ReportReasonSheet'
import { REPORT_TITLE_KEYS } from '@/features/reports/utils/reportLabels'
import { useCancelSpot } from '../hooks/useCancelSpot'
import type { Spot } from '../types'
import { colors } from '@/shared/theme'

type Props = {
  spot: Spot
  isCreator: boolean
}

/**
 * ⋯ sobreposto na capa do card — um gatilho para os dois públicos: o criador
 * gerencia, quem passa denuncia.
 *
 * Renovar não age aqui: ele consome a quota diária e o 429 pede a folha de
 * upsell, que já existe no detalhe. O deep-link `renew=1` (o mesmo da
 * notificação "seu rolê está acabando") leva pra lá com o CTA em destaque.
 *
 * Denúncia mira o CRIADOR: não existe endpoint de denúncia de rolê no backend,
 * e inventar um alvo que ele não conhece daria 404 no envio.
 */
export function SpotFeedMenu({ spot, isCreator }: Props) {
  const { t } = useTranslation()
  const router = useRouter()
  const confirm = useConfirm()
  const [open, setOpen] = useState(false)
  const cancel = useCancelSpot(spot.id)
  const report = useReportFlow()

  async function handleCancel() {
    const ok = await confirm({
      title: t('spots.detail.cancelTitle'),
      message: t('spots.detail.cancelMessage'),
      confirmLabel: t('spots.detail.cancelTitle'),
      destructive: true,
    })
    // O optimistic remove do useCancelSpot tira o card da lista sozinho.
    if (ok) cancel.mutate()
  }

  const actions: MenuAction[] = isCreator
    ? [
        {
          label: t('spots.owner.edit'),
          onPress: () => router.push(`/spots/${spot.id}/edit`),
        },
        {
          label: t('spots.owner.renew'),
          onPress: () => router.push(`/spots/${spot.id}?renew=1`),
        },
        {
          label: t('spots.owner.cancel'),
          onPress: handleCancel,
          destructive: true,
        },
      ]
    : [
        {
          label: t(REPORT_TITLE_KEYS.user),
          onPress: () =>
            report.requestReport({
              type: 'user',
              id: spot.creator.id,
              label: spot.creator.username,
            }),
        },
      ]

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('spots.feedCard.moreActions')}
        className="h-9 w-9 items-center justify-center rounded-full bg-background/60"
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
