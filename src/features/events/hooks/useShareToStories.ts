import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, Platform } from 'react-native'
import { useTranslation } from 'react-i18next'
import * as Clipboard from 'expo-clipboard'
import type { EventDetail } from '@/shared/types'
import { useBanner } from '@/shared/lib/banner'
import { SHEET_EXIT_MS } from '@/shared/components/SheetModal'
import { useLocale } from '@/shared/hooks/useLocale'
import { formatDayOfMonthAtTime } from '@/shared/utils/dateFormat'
import type { StoryArtData } from '../components/share/StoryArtTemplate'
import {
  shareStoryArtToSystem,
  shareToInstagramStories,
} from '../lib/instagramStories'
import { FALLBACK_ASPECT, measureCoverAspect } from '../lib/storyCanvas'
import { useCreateInviteLink } from './useCreateInviteLink'

type Args = {
  event: EventDetail
  onShared?: () => void
}

// A arte só existe montada na etapa de captura; a partir dali o que importa é o
// arquivo. Estados como união fechada porque o botão, a montagem da arte, a
// folha de instrução e a folha da volta leem cada um a sua etapa — booleanos
// soltos permitiriam combinações que não existem.
type Flow =
  | { step: 'capturing'; url: string; art: StoryArtData }
  | { step: 'instructing'; url: string; uri: string }
  | { step: 'returned'; url: string }

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Orquestra o caminho "Stories do Instagram": link de convite → arte montada e
// capturada → instrução do sticker de Link → composer do IG → (iOS) folha de
// cópia na volta ao app.
export function useShareToStories({ event, onShared }: Args) {
  const { t } = useTranslation()
  const locale = useLocale()
  const showBanner = useBanner()
  const createInviteLink = useCreateInviteLink(event.id)
  const [flow, setFlow] = useState<Flow | null>(null)

  const start = useCallback(async () => {
    try {
      const { url } = await createInviteLink.mutateAsync()
      const coverUrl = event.images[0]?.url ?? null
      const coverAspect = coverUrl
        ? await measureCoverAspect(coverUrl)
        : FALLBACK_ASPECT
      setFlow({
        step: 'capturing',
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
          // Na arte vai SÓ o domínio: o link do evento é o sticker de Link,
          // e a pílula é o alvo onde ele se encaixa. A URL completa impressa
          // (token de 22 chars) era intocável de tão longa e o sticker não a
          // cobria (visto em aparelho).
          urlLabel: url.replace(/^https?:\/\//, '').split('/')[0],
          coverUrl,
          coverAspect,
        },
      })
    } catch {
      // Falha ao gerar o link — silencioso, mesmo padrão do share atual.
    }
  }, [createInviteLink, event, locale, t])

  const handleCaptured = useCallback((uri: string | null) => {
    // Falha de captura é silenciosa (padrão do app) e derruba o fluxo inteiro:
    // sem arte não há o que instruir nem o que compartilhar.
    if (!uri) {
      setFlow(null)
      return
    }
    // TODO analytics: instrução exibida (com a plataforma).
    setFlow(current =>
      current?.step === 'capturing'
        ? { step: 'instructing', url: current.url, uri }
        : null,
    )
  }, [])

  const dismissInstructions = useCallback(() => {
    // TODO analytics: instrução dispensada — dispensar NÃO compartilha.
    setFlow(null)
  }, [])

  const shareArtToSystem = useCallback(
    async (uri: string, url: string) => {
      // Este caminho não passa pelo pasteboard, então copiar antes é seguro.
      await Clipboard.setStringAsync(url)
      showBanner(t('events.share.stories.linkCopied'))
      if (await shareStoryArtToSystem(uri)) onShared?.()
    },
    [onShared, showBanner, t],
  )

  // iOS: quando o usuário volta ao app com o composer aberto no Instagram, a
  // folha de cópia entra em cena — e FICA até ele copiar ou dispensar (banner
  // sozinho evaporava antes de o usuário se orientar; visto em aparelho).
  // Junto vai uma cópia silenciosa de segurança, pro link existir na área de
  // transferência mesmo se a folha for dispensada sem copiar.
  // Uma assinatura por vez — share repetido antes da volta não empilha folha.
  const pendingReturn = useRef<{ remove: () => void } | null>(null)

  const armReturnSheet = useCallback((url: string) => {
    pendingReturn.current?.remove()
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') return
      subscription.remove()
      pendingReturn.current = null
      Clipboard.setStringAsync(url).catch(() => {})
      setFlow({ step: 'returned', url })
    })
    pendingReturn.current = subscription
  }, [])

  useEffect(() => () => pendingReturn.current?.remove(), [])

  const copyReturnLink = useCallback(async () => {
    if (flow?.step !== 'returned') return
    await Clipboard.setStringAsync(flow.url)
    showBanner(t('events.share.stories.linkCopiedReturn'))
    setFlow(null)
  }, [flow, showBanner, t])

  const dismissReturnSheet = useCallback(() => setFlow(null), [])

  const confirmInstructions = useCallback(async () => {
    if (flow?.step !== 'instructing') return
    const { uri, url } = flow
    // TODO analytics: instrução confirmada.
    setFlow(null)

    const handedOff = await shareToInstagramStories(uri, url)
    // TODO analytics: resultado do share por plataforma. Hoje o motivo da
    // falha se perde: shareToInstagramStories achata o erro da lib (IG
    // ausente, asset recusado, cancelamento) num booleano — distinguir exige
    // inspecioná-lo.
    if (!handedOff) {
      // Só no iOS: no Android a folha de opções já filtra quem não tem o IG, e
      // o silêncio em falha é o comportamento de hoje.
      //
      // A espera é a saída da folha de instrução: apresentar o share do sistema
      // enquanto ela ainda desliza estoura "presentation is in progress".
      if (Platform.OS === 'ios') {
        await wait(SHEET_EXIT_MS)
        await shareArtToSystem(uri, url)
      }
      return
    }
    // O link não é tocável no story (restrição da Meta a não-parceiros); o
    // caminho é clipboard + sticker de Link, e cada plataforma copia num
    // momento diferente:
    //
    // Android: agora — o Intent não disputa a área de transferência.
    //
    // iOS: só na VOLTA ao app. Copiar antes apagaria a arte (o handoff É o
    // pasteboard) e o Instagram LIMPA o pasteboard inteiro ao consumir a arte;
    // reescrever em background é no-op (provado em aparelho — ver
    // docs/share-stories-instagram.md). Na volta, a folha de cópia segura a
    // instrução na tela até o usuário copiar e voltar pro Instagram.
    if (Platform.OS === 'android') await Clipboard.setStringAsync(url)
    if (Platform.OS === 'ios') armReturnSheet(url)
    onShared?.()
  }, [armReturnSheet, flow, onShared, shareArtToSystem])

  return {
    start,
    // Cobre a espera inteira até o handoff: gerar o link, montar/capturar a
    // arte e a folha de instrução. A folha da volta ('returned') fica de fora:
    // o share já aconteceu, o botão não pode parecer ocupado.
    isPreparing:
      createInviteLink.isPending || (flow !== null && flow.step !== 'returned'),
    art: flow?.step === 'capturing' ? flow.art : null,
    handleCaptured,
    instructionsVisible: flow?.step === 'instructing',
    confirmInstructions,
    dismissInstructions,
    returnSheetVisible: flow?.step === 'returned',
    copyReturnLink,
    dismissReturnSheet,
  }
}
