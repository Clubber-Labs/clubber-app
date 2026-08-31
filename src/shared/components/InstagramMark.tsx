import { Image } from 'react-native'

type Props = {
  size?: number
}

/**
 * Glifo oficial do Instagram no gradiente da marca (brand kit da Meta). É PNG,
 * não SVG, porque o gradiente oficial é um mesh: o próprio .svg do kit não
 * passa de um clipPath com esse mesmo raster embutido. Sem prop `color` — as
 * guidelines não admitem recolorir. Mesmo papel do SpotifyMark.
 */
export function InstagramMark({ size = 20 }: Props) {
  return (
    <Image
      source={require('../../../assets/instagram-icon.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
      // Sempre decorativo: o rótulo da linha é quem nomeia a ação.
      accessible={false}
      importantForAccessibility="no"
    />
  )
}
