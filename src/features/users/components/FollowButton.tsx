import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { useConfirm } from '@/shared/lib/confirm'
import type { FollowStatus } from '@/shared/types'

type Props = {
  status: FollowStatus
  loading?: boolean
  onFollow: () => void
  onUnfollow: () => void
}

export function FollowButton({ status, loading, onFollow, onUnfollow }: Props) {
  const { t } = useTranslation()
  const confirm = useConfirm()

  async function handlePress() {
    if (status === 'ACCEPTED') {
      const ok = await confirm({
        title: t('follows.unfollowTitle'),
        message: t('follows.unfollowMessage'),
        confirmLabel: t('follows.unfollowTitle'),
        destructive: true,
      })
      if (ok) onUnfollow()
      return
    }
    if (status === 'PENDING') {
      const ok = await confirm({
        title: t('follows.cancelRequestTitle'),
        message: t('follows.cancelRequestMessage'),
        confirmLabel: t('follows.cancelRequestConfirm'),
        cancelLabel: t('follows.no'),
        destructive: true,
      })
      if (ok) onUnfollow()
      return
    }
    onFollow()
  }

  const label =
    status === 'ACCEPTED'
      ? t('follows.following')
      : status === 'PENDING'
        ? t('follows.requested')
        : t('follows.follow')
  const variant = status === null ? 'primary' : 'secondary'

  return (
    <Button
      label={label}
      onPress={handlePress}
      loading={loading}
      variant={variant}
    />
  )
}
