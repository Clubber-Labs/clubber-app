import { Image } from 'react-native'

type Props = {
  size?: number
  /**
   * Sem cor = verde oficial do asset. Passe um tom nos contextos sem vínculo
   * e nos placeholders de foto de artista (lá o ícone é "falta foto", não
   * marca do Spotify).
   */
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
      // Sempre decorativo: o texto adjacente é quem nomeia (atribuição, rótulo
      // da linha) — sem isto o TalkBack anuncia uma imagem sem nome.
      accessible={false}
      importantForAccessibility="no"
    />
  )
}
