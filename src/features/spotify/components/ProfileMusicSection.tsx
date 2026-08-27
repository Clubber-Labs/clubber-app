import type {
  ArtistMatch,
  FeaturedArtist,
  ProfileArtist,
  SpotifyWindow,
} from '@/shared/types'
import { useState } from 'react'
import { ArtistMatchRow } from './ArtistMatchRow'
import { FeaturedArtistCard } from './FeaturedArtistCard'
import { TopArtistsRow } from './TopArtistsRow'
import { WindowSelector } from './WindowSelector'

type Props = {
  featured: FeaturedArtist | null | undefined
  artists: ProfileArtist[]
  /** Ausente ou null quando o dono não ligou o seletor de período. */
  windows?: Record<SpotifyWindow, FeaturedArtist[]> | null
  /** Ausente no perfil próprio: ninguém faz match consigo mesmo. */
  match?: ArtistMatch | null
}

/** A janela que o servidor usa quando não há escolha. */
const DEFAULT_WINDOW: SpotifyWindow = 'medium_term'

/**
 * O bloco musical do perfil, na ordem em que ele se explica: o período, o mais
 * ouvido, o resto da fileira, e por último o que vocês têm em comum — o match é
 * conclusão do gosto da pessoa, não abertura.
 *
 * Existe para as duas telas de perfil não repetirem a montagem, sobretudo o
 * corte do destacado: sem ele o primeiro colocado apareceria duas vezes.
 */
export function ProfileMusicSection({
  featured,
  artists,
  windows,
  match,
}: Props) {
  const [window, setWindow] = useState<SpotifyWindow>(DEFAULT_WINDOW)

  // Só o destaque muda de janela; o match não, porque o servidor cruza sempre a
  // padrão — comparar o "agora" de um com o "sempre" de outro não diria nada.
  const windowArtists = windows?.[window]
  // `featured` nulo significa que o dono desligou o destaque: nesse caso
  // nenhuma janela destaca ninguém.
  const showFeatured = !!featured
  const currentFeatured = windowArtists
    ? showFeatured
      ? (windowArtists[0] ?? null)
      : null
    : featured
  const currentArtists = windowArtists ?? artists

  return (
    <>
      {windows && <WindowSelector value={window} onChange={setWindow} />}
      <FeaturedArtistCard artist={currentFeatured} />
      <TopArtistsRow
        artists={currentArtists.filter(a => a.id !== currentFeatured?.id)}
      />
      <ArtistMatchRow match={match} />
    </>
  )
}
