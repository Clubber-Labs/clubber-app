import { ActivityIndicator, Pressable, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CheckIcon } from 'phosphor-react-native'
import { useConfirm } from '@/shared/lib/confirm'
import { shouldConfirmUnfollow } from '../utils/unfollowConfirm'
import type { FollowStatus } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  status: FollowStatus
  followedAt?: string | null
  loading?: boolean
  onFollow: () => void
  onUnfollow: () => void
}

// Não seguindo = pílula branca cheia (a ação principal do perfil); seguindo ou
// solicitado = contorno, com o check dizendo que já está feito.
export function FollowButton({
  status,
  followedAt,
  loading,
  onFollow,
  onUnfollow,
}: Props) {
  const { t } = useTranslation()
  const confirm = useConfirm()

  async function handlePress() {
    if (status === 'ACCEPTED') {
      if (shouldConfirmUnfollow(followedAt)) {
        const ok = await confirm({
          title: t('follows.unfollowTitle'),
          message: t('follows.unfollowMessage'),
          confirmLabel: t('follows.unfollowTitle'),
          destructive: true,
        })
        if (!ok) return
      }
      onUnfollow()
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

  const filled = status === null
  const label =
    status === 'ACCEPTED'
      ? t('follows.following')
      : status === 'PENDING'
        ? t('follows.requested')
        : t('follows.follow')

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!loading, busy: !!loading }}
      className={`h-11 flex-row items-center justify-center gap-1.5 rounded-full ${
        filled ? 'bg-content' : 'border border-line-strong'
      }`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={filled ? colors.background : colors.contentSecondary}
        />
      ) : (
        <>
          {status === 'ACCEPTED' && (
            <CheckIcon
              size={14}
              weight="bold"
              color={colors.contentSecondary}
            />
          )}
          <Text
            className={`text-[13px] font-bold ${
              filled ? 'text-background' : 'text-content-secondary'
            }`}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  )
}
