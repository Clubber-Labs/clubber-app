import { Image } from 'react-native'

type Props = {
  size?: number
  /** Sem cor = verde oficial do asset. Passe um tom pro estado desvinculado. */
  color?: string
}

/**
 * Ícone oficial do Spotify (brand kit 2024 — as guidelines proíbem redesenhos,
 * então nada de phosphor aqui). As ondas do PNG são recorte transparente: o
 * tint recolore só o círculo e a forma se preserva.
 */
export function SpotifyMark({ size = 20, color }: Props) {
  return (
    <Image
      source={require('../../../assets/spotify-icon.png')}
      style={{ width: size, height: size, tintColor: color }}
      resizeMode="contain"
    />
  )
}
