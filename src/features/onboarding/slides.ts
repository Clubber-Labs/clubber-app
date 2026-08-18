import type { ReactElement } from 'react'
import { ArtOpening } from './components/slides/ArtOpening'
import { ArtMap } from './components/slides/ArtMap'
import { ArtSpot } from './components/slides/ArtSpot'
import { ArtSocial } from './components/slides/ArtSocial'
import { ArtFinal } from './components/slides/ArtFinal'
import type { ArtProps } from './types'

// Título e corpo são CHAVES do dicionário, traduzidas no render pela tela:
// frase pronta aqui congelaria o idioma no import do módulo. As unions mantêm
// o gate do typecheck — chave inexistente não compila.
type SlideName = 'opening' | 'map' | 'spot' | 'social' | 'final'
type SlideTitleKey = `onboarding.slides.${Exclude<SlideName, 'final'>}.title`
type SlideBodyKey = `onboarding.slides.${SlideName}.body`

export type Slide = {
  art: (props: ArtProps) => ReactElement
  titleKey?: SlideTitleKey
  bodyKey: SlideBodyKey
  // Arte que ocupa a tela inteira atrás do texto (mapa) em vez de bloco no fluxo.
  fullBleed?: boolean
}

// Onboarding "2a — Sempre tem coisa rolando": 5 telas contando a história de
// rolês e eventos (festa, balada, trilha, camping — não só noite), compostas
// com as artes reais do produto (gota de evento, balão de rolê, LivePill).
export const SLIDES: Slide[] = [
  {
    art: ArtOpening,
    titleKey: 'onboarding.slides.opening.title',
    bodyKey: 'onboarding.slides.opening.body',
  },
  {
    art: ArtMap,
    fullBleed: true,
    titleKey: 'onboarding.slides.map.title',
    bodyKey: 'onboarding.slides.map.body',
  },
  {
    art: ArtSpot,
    fullBleed: true,
    titleKey: 'onboarding.slides.spot.title',
    bodyKey: 'onboarding.slides.spot.body',
  },
  {
    art: ArtSocial,
    titleKey: 'onboarding.slides.social.title',
    bodyKey: 'onboarding.slides.social.body',
  },
  {
    // Sem título: o wordmark é o herói da tela final.
    art: ArtFinal,
    bodyKey: 'onboarding.slides.final.body',
  },
]
