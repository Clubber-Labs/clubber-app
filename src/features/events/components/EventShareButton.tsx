import { Pressable, Share } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ShareNetworkIcon } from 'phosphor-react-native'
import * as Linking from 'expo-linking'
import { colors } from '@/shared/theme'

type Props = {
  eventId: string
  title: string
  // Disparado só quando o compartilhamento é concluído (não no cancelamento) —
  // a tela liga isso ao tracking de analytics.
  onShared?: () => void
}

// Botão de compartilhar do header do evento. Mesmo estilo dos outros botões de
// overlay (ações, denúncia). Visível para qualquer usuário.
export function EventShareButton({ eventId, title, onShared }: Props) {
  const { t } = useTranslation()
  async function handleShare() {
    try {
      const url = Linking.createURL(`/events/${eventId}`)
      const result = await Share.share({
        title,
        message: t('events.share.message', { title, url }),
      })
      if (result.action === Share.sharedAction) onShared?.()
    } catch {
      // Compartilhamento cancelado/indisponível — silencioso (padrão do app).
    }
  }

  return (
    <Pressable
      onPress={handleShare}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t('events.share.label')}
      className="w-10 h-10 items-center justify-center rounded-full bg-background/50"
    >
      <ShareNetworkIcon size={20} color={colors.content} />
    </Pressable>
  )
}
