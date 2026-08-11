import type { ReactElement } from 'react'
import { ArtOpening } from './components/slides/ArtOpening'
import { ArtMap } from './components/slides/ArtMap'
import { ArtSpot } from './components/slides/ArtSpot'
import { ArtSocial } from './components/slides/ArtSocial'
import { ArtFinal } from './components/slides/ArtFinal'
import type { ArtProps } from './types'

export type Slide = {
  art: (props: ArtProps) => ReactElement
  title?: string
  body: string
  // Arte que ocupa a tela inteira atrás do texto (mapa) em vez de bloco no fluxo.
  fullBleed?: boolean
}

// Onboarding "2a — Sempre tem coisa rolando": 5 telas contando a história de
// rolês e eventos (festa, balada, trilha, camping — não só noite), compostas
// com as artes reais do produto (gota de evento, balão de rolê, LivePill).
export const SLIDES: Slide[] = [
  {
    art: ArtOpening,
    title: 'Sempre tem coisa rolando',
    body: 'Festa, balada, trilha, camping, after. O Clubber mostra o que tá vivo — agora.',
  },
  {
    art: ArtMap,
    fullBleed: true,
    title: 'Eventos no lugar exato',
    body: 'Cada gota é algo acontecendo de verdade — de dia, de tarde, de madrugada.',
  },
  {
    art: ArtSpot,
    fullBleed: true,
    title: 'Rolê é o que você inventar',
    body: 'Esquenta, show, café, after — solta um balão e virou ponto de encontro.',
  },
  {
    art: ArtSocial,
    title: 'Chega junto',
    body: 'Veja quem vai, entre na conversa e combine o rolê — tudo dentro do Clubber.',
  },
  {
    // Sem title: o wordmark é o herói da tela final.
    art: ArtFinal,
    body: 'Cria sua conta, vire um Clubber e descubra o que tá rolando perto de você.',
  },
]
