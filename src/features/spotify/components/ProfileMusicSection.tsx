import type { ArtistMatch, FeaturedArtist, ProfileArtist } from '@/shared/types'
import { ArtistMatchRow } from './ArtistMatchRow'
import { FeaturedArtistCard } from './FeaturedArtistCard'
import { TopArtistsRow } from './TopArtistsRow'

type Props = {
  featured: FeaturedArtist | null | undefined
  artists: ProfileArtist[]
  /** Ausente no perfil próprio: ninguém faz match consigo mesmo. */
  match?: ArtistMatch | null
}

/**
 * O bloco musical do perfil, na ordem em que ele se explica: o mais ouvido,
 * depois o resto da fileira, e por último o que vocês têm em comum — o match é
 * conclusão do gosto da pessoa, não abertura.
 *
 * Existe para as duas telas de perfil não repetirem a montagem, sobretudo o
 * corte do destacado: sem ele o primeiro colocado apareceria duas vezes.
 */
export function ProfileMusicSection({ featured, artists, match }: Props) {
  return (
    <>
      <FeaturedArtistCard artist={featured} />
      <TopArtistsRow artists={artists.filter(a => a.id !== featured?.id)} />
      <ArtistMatchRow match={match} />
    </>
  )
}
