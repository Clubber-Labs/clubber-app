import {
  type ArtistMatch,
  type FeaturedArtist,
  type ProfileArtist,
  SPOTIFY_WINDOWS,
  type SpotifyWindow,
} from '@/shared/types'
import { useState } from 'react'
import { ArtistMatchRow } from './ArtistMatchRow'
import { FeaturedArtistCard } from './FeaturedArtistCard'
import { TopArtistsRow } from './TopArtistsRow'
import { WindowSelector } from './WindowSelector'

type Props = {
  featured: FeaturedArtist | null | undefined
  artists: ProfileArtist[]
  /** Só as janelas com artistas; null quando não há seletor a oferecer. */
  windows?: Partial<Record<SpotifyWindow, FeaturedArtist[]>> | null
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
  const [picked, setPicked] = useState<SpotifyWindow>(DEFAULT_WINDOW)

  // Filtra a ordem canônica em vez de ler as chaves do objeto: "a primeira
  // disponível" tem de significar a mais recente, não a que o servidor
  // serializou primeiro.
  const available = SPOTIFY_WINDOWS.filter(w => windows?.[w])

  // Resolvido no render, não guardado: as janelas podem chegar DEPOIS da
  // montagem — o dono liga o toggle e volta pro perfil sem a tela desmontar —
  // e um estado inicial fixo deixaria o seletor sem aba ativa quando a janela
  // padrão não existe.
  const selectedWindow = available.includes(picked)
    ? picked
    : (available[0] ?? picked)

  // Só o destaque e a fileira mudam de janela; o match não, porque o servidor
  // cruza sempre a padrão — comparar o "agora" de um com o "sempre" de outro
  // não diria nada.
  const windowArtists = windows?.[selectedWindow]
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
      {windows && (
        <WindowSelector
          available={available}
          value={selectedWindow}
          onChange={setPicked}
        />
      )}
      <FeaturedArtistCard artist={currentFeatured} />
      <TopArtistsRow
        artists={currentArtists.filter(a => a.id !== currentFeatured?.id)}
      />
      <ArtistMatchRow match={match} />
    </>
  )
}
