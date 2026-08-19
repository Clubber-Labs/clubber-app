import Svg, { Rect, Circle, Path } from 'react-native-svg'
import { colors } from '@/shared/theme'

type Props = { size?: number; color?: string }

// Símbolo da marca — "b de balão". No chrome sempre reto e 1 cor
// (regra da identidade: a vida vem do conteúdo, não da marca).
// Estes paths estão espelhados em scripts/build-splash-logo.mjs, que rasteriza a
// splash nativa e não consegue rodar react-native-svg: mexeu aqui, rode
// `pnpm splash:build` — a divergência seria silenciosa.
export function BrandB({ size = 24, color = colors.content }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="27" y="16" width="13" height="64" rx="6.5" fill={color} />
      <Circle
        cx="55"
        cy="60.5"
        r="15.5"
        fill="none"
        stroke={color}
        strokeWidth="12"
      />
      <Path
        d="M61 77 Q69 86 81 88 Q75 80 74 68 Q69 74.5 61 77 Z"
        fill={color}
      />
    </Svg>
  )
}
