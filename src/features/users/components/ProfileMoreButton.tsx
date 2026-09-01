import { useState } from 'react'
import { Pressable, Share } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { DotsThreeIcon } from 'phosphor-react-native'
import { SHEET_EXIT_MS } from '@/shared/components/SheetModal'
import { useConfirm } from '@/shared/lib/confirm'
import { useBanner } from '@/shared/lib/banner'
import { getApiError } from '@/shared/lib/apiError'
import { useBlockUser } from '@/features/chat/hooks/useBlocks'
import { useReportFlow } from '@/features/reports/hooks/useReportFlow'
import { ReportReasonSheet } from '@/features/reports/components/ReportReasonSheet'
import { ProfileMoreSheet } from './ProfileMoreSheet'
import { profileShareUrl } from '../utils/profileShare'
import { formatFullName } from '@/shared/utils/fullName'
import type { UserProfile } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  profile: UserProfile
}

// ⋯ do perfil de terceiro: compartilhar, denunciar, bloquear. Cada ação abre
// outra apresentação (share do sistema, folha de motivo, confirm), então espera
// a folha sair antes — no iOS o atropelo estoura "presentation in progress".
export function ProfileMoreButton({ profile }: Props) {
  const { t } = useTranslation()
  const router = useRouter()
  const confirm = useConfirm()
  const showBanner = useBanner()
  const block = useBlockUser()
  const report = useReportFlow()
  const [open, setOpen] = useState(false)

  function afterClose(action: () => void) {
    setOpen(false)
    setTimeout(action, SHEET_EXIT_MS)
  }

  async function share() {
    try {
      await Share.share({
        message: t('profile.share.message', {
          name: formatFullName(profile.name, profile.lastname),
          username: profile.username,
          url: profileShareUrl(profile.username),
        }),
      })
    } catch {
      // Cancelar a folha do sistema não é erro.
    }
  }

  async function blockUser() {
    const ok = await confirm({
      title: t('profile.more.blockTitle', { username: profile.username }),
      message: t('profile.more.blockMessage', { name: profile.name }),
      confirmLabel: t('profile.more.blockConfirm'),
      destructive: true,
    })
    if (!ok) return
    block.mutate(profile.id, {
      // Bloqueado, o perfil deixa de ser visível — não há o que ficar olhando.
      onSuccess: () => router.back(),
      onError: e => showBanner(getApiError(e).message),
    })
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t('profile.more.label')}
        className="h-11 w-11 items-center justify-center rounded-full border border-line-strong"
      >
        <DotsThreeIcon
          size={20}
          weight="bold"
          color={colors.contentSecondary}
        />
      </Pressable>
      <ProfileMoreSheet
        visible={open}
        username={profile.username}
        onClose={() => setOpen(false)}
        onShare={() => afterClose(() => void share())}
        onReport={() =>
          afterClose(() =>
            report.requestReport({
              type: 'user',
              id: profile.id,
              label: profile.username,
            }),
          )
        }
        onBlock={() => afterClose(() => void blockUser())}
      />
      <ReportReasonSheet
        target={report.target}
        onClose={report.close}
        onSubmit={report.submit}
      />
    </>
  )
}
