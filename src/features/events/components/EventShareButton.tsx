import { useState } from 'react'
import { Pressable, Share } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ShareNetworkIcon } from 'phosphor-react-native'
import type { EventDetail } from '@/shared/types'
import { useCreateInviteLink } from '../hooks/useCreateInviteLink'
import { useCanShareToStories } from '../hooks/useCanShareToStories'
import { useShareToStories } from '../hooks/useShareToStories'
import { ShareOptionsSheet } from './share/ShareOptionsSheet'
import { StoryArtCapture } from './share/StoryArtCapture'
import { StoryLinkInstructions } from './share/StoryLinkInstructions'
import { StoryLinkReturnSheet } from './share/StoryLinkReturnSheet'
import { SHEET_EXIT_MS } from '@/shared/components/SheetModal'
import { colors } from '@/shared/theme'

type Props = {
  event: EventDetail
  // Disparado só quando o compartilhamento é concluído (não no cancelamento) —
  // a tela liga isso ao tracking de analytics.
  onShared?: () => void
}

// Botão de compartilhar do header do evento. Só o autor o monta: o link de
// convite vem de endpoint author-only (403 NOT_EVENT_AUTHOR), e a URL é sempre
// a do backend — o client nunca monta link de convite.
export function EventShareButton({ event, onShared }: Props) {
  const { t } = useTranslation()
  const createInviteLink = useCreateInviteLink(event.id)
  const canShareToStories = useCanShareToStories()
  const stories = useShareToStories({ event, onShared })
  const [sheetVisible, setSheetVisible] = useState(false)

  async function shareToOtherApps() {
    try {
      const { url } = await createInviteLink.mutateAsync()
      const result = await Share.share({
        title: event.title,
        message: t('events.share.message', { title: event.title, url }),
      })
      if (result.action === Share.sharedAction) onShared?.()
    } catch {
      // Falha ao gerar o link ou compartilhamento cancelado/indisponível —
      // silencioso (padrão do app).
    }
  }

  // O share do sistema é um UIActivityViewController: apresentá-lo enquanto a
  // folha ainda desliza pra fora estoura "presentation is in progress" no iOS.
  // O caminho dos Stories não sofre disso (abre outro app por URL/Intent), mas
  // esperar nos dois mantém uma regra só.
  function chooseOption(run: () => void) {
    setSheetVisible(false)
    setTimeout(run, SHEET_EXIT_MS)
  }

  function handlePress() {
    if (canShareToStories) setSheetVisible(true)
    else shareToOtherApps()
  }

  return (
    <>
      <Pressable
        onPress={handlePress}
        disabled={createInviteLink.isPending || stories.isPreparing}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('events.share.label')}
        className="w-10 h-10 items-center justify-center rounded-full bg-background/50"
      >
        <ShareNetworkIcon size={20} color={colors.content} />
      </Pressable>
      <ShareOptionsSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onShareToStories={() => chooseOption(stories.start)}
        onShareToOtherApps={() => chooseOption(shareToOtherApps)}
      />
      {stories.art && (
        <StoryArtCapture
          data={stories.art}
          onCaptured={stories.handleCaptured}
        />
      )}
      <StoryLinkInstructions
        visible={stories.instructionsVisible}
        onConfirm={stories.confirmInstructions}
        onClose={stories.dismissInstructions}
      />
      <StoryLinkReturnSheet
        visible={stories.returnSheetVisible}
        onCopy={stories.copyReturnLink}
        onClose={stories.dismissReturnSheet}
      />
    </>
  )
}
