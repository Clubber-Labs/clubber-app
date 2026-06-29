import { Pressable, Share } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
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
  async function handleShare() {
    try {
      const url = Linking.createURL(`/events/${eventId}`)
      const result = await Share.share({
        title,
        message: `${title}\n\nConfira no Clubber: ${url}`,
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
      accessibilityLabel="Compartilhar evento"
      className="w-10 h-10 items-center justify-center rounded-full bg-background/50"
    >
      <Ionicons name="share-outline" size={20} color={colors.content} />
    </Pressable>
  )
}
