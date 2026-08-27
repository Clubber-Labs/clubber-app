import { useCallback, useState } from 'react'
import { Platform } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as Clipboard from 'expo-clipboard'
import type { EventDetail } from '@/shared/types'
import { useBanner } from '@/shared/lib/banner'
import { useLocale } from '@/shared/hooks/useLocale'
import { formatDayOfMonthAtTime } from '@/shared/utils/dateFormat'
import type { StoryArtData } from '../components/share/StoryArtTemplate'
import { shareToInstagramStories } from '../lib/instagramStories'
import { FALLBACK_ASPECT, measureCoverAspect } from '../lib/storyCanvas'
import { useCreateInviteLink } from './useCreateInviteLink'

type Args = {
  event: EventDetail
  onShared?: () => void
}

type Pending = {
  art: StoryArtData
  url: string
}

// Orquestra o caminho "Stories do Instagram": link de convite → arte montada e
// capturada → composer do IG → link no clipboard. A arte só existe montada
// entre o start e a captura; fora disso `pending` é null e nada é renderizado.
export function useShareToStories({ event, onShared }: Args) {
  const { t } = useTranslation()
  const locale = useLocale()
  const showBanner = useBanner()
  const createInviteLink = useCreateInviteLink(event.id)
  const [pending, setPending] = useState<Pending | null>(null)

  const start = useCallback(async () => {
    try {
      const { url } = await createInviteLink.mutateAsync()
      const coverUrl = event.images[0]?.url ?? null
      const coverAspect = coverUrl
        ? await measureCoverAspect(coverUrl)
        : FALLBACK_ASPECT
      setPending({
        url,
        art: {
          title: event.title,
          dateLabel: formatDayOfMonthAtTime(
            event.date,
            locale,
            event.timezone ?? undefined,
          ),
          authorLabel: t('events.share.stories.byAuthor', {
            username: event.author.username,
          }),
          // A URL vai impressa na arte sem o esquema: mais curta de ler e de
          // digitar por quem vê o story.
          urlLabel: url.replace(/^https?:\/\//, ''),
          coverUrl,
          coverAspect,
        },
      })
    } catch {
      // Falha ao gerar o link — silencioso, mesmo padrão do share atual.
    }
  }, [createInviteLink, event, locale, t])

  const handleCaptured = useCallback(
    async (uri: string | null) => {
      const current = pending
      setPending(null)
      if (!current || !uri) return
      const shared = await shareToInstagramStories(uri)
      if (!shared) return
      // O link não é tocável no story (restrição da Meta a não-parceiros): o
      // clipboard é o que permite colar no sticker de Link em dois toques.
      //
      // Só no Android. No iOS o handoff É o pasteboard — a lib põe a arte lá e
      // abre o IG, que só lê no launch: escrever o link aqui apagaria a arte
      // antes de ela ser lida, e o composer abriria VAZIO. Lá a URL impressa na
      // arte é o único caminho. Ver docs/share-stories-instagram.md.
      if (Platform.OS === 'android') {
        await Clipboard.setStringAsync(current.url)
        showBanner(t('events.share.stories.linkCopied'))
      }
      onShared?.()
    },
    [onShared, pending, showBanner, t],
  )

  return {
    start,
    // Cobre os dois trechos de espera: gerar o link e montar/capturar a arte.
    isPreparing: createInviteLink.isPending || pending !== null,
    art: pending?.art ?? null,
    handleCaptured,
  }
}
