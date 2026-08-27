/** Espelha o spotifyProfileResponseSchema do backend. */
export type SpotifyArtist = {
  id: string
  name: string
  imageUrl: string | null
  /** Atribuição exigida pelo Spotify: o artista leva de volta pra lá. */
  spotifyUrl: string
  rank: number
  /** Oculto do perfil público. Só o dono recebe esta marca. */
  hidden: boolean
}

export type SpotifyProfile = {
  linked: boolean
  /** REVOKED = o usuário removeu o Clubber em spotify.com/account/apps. */
  status: 'ACTIVE' | 'REVOKED' | null
  displayName: string | null
  lastSyncedAt: string | null
  artistsVisible: boolean
  /** Chaves GENRE_* da nossa taxonomia, por afinidade. */
  genres: string[]
  artists: SpotifyArtist[]
}

export type ApplyGenresResult = {
  /** O que de fato entrou (o servidor limita a quantidade). */
  applied: string[]
  /** Estado final dos interesses do perfil, já com o merge. */
  interests: string[]
}
