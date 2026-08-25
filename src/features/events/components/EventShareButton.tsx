import { Pressable, Share } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ShareNetworkIcon } from 'phosphor-react-native'
import { useCreateInviteLink } from '../hooks/useCreateInviteLink'
import { colors } from '@/shared/theme'

type Props = {
  eventId: string
  title: string
  // Disparado só quando o compartilhamento é concluído (não no cancelamento) —
  // a tela liga isso ao tracking de analytics.
  onShared?: () => void
}

// Botão de compartilhar do header do evento. Só o autor o monta: o link de
// convite vem de endpoint author-only (403 NOT_EVENT_AUTHOR), e a URL é sempre
// a do backend — o client nunca monta link de convite.
export function EventShareButton({ eventId, title, onShared }: Props) {
  const { t } = useTranslation()
  const createInviteLink = useCreateInviteLink(eventId)

  async function handleShare() {
    try {
      const { url } = await createInviteLink.mutateAsync()
      const result = await Share.share({
        title,
        message: t('events.share.message', { title, url }),
      })
      if (result.action === Share.sharedAction) onShared?.()
    } catch {
      // Falha ao gerar o link ou compartilhamento cancelado/indisponível —
      // silencioso (padrão do app).
    }
  }

  return (
    <Pressable
      onPress={handleShare}
      disabled={createInviteLink.isPending}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t('events.share.label')}
      className="w-10 h-10 items-center justify-center rounded-full bg-background/50"
    >
      <ShareNetworkIcon size={20} color={colors.content} />
    </Pressable>
  )
}
