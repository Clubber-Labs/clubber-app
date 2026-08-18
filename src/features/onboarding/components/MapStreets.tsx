import { View } from 'react-native'
import { colors } from '@/shared/theme'

// Ruas do mapa de fundo, data-driven: cada tela declara seu traçado. A malha
// imita mapa de verdade — grade ortogonal inteira rotacionada num mesmo
// ângulo (ruas paralelas formando quarteirões, espaçamento irregular).
export type Street = {
  // 'h' corre na horizontal (at = posição vertical); 'v' na vertical.
  axis: 'h' | 'v'
  at: `${number}%`
  rotate: `${number}deg`
  thickness?: number
}

export function MapStreets({ streets }: { streets: Street[] }) {
  return (
    <>
      {streets.map((s, i) => (
        <View
          key={i}
          className="absolute"
          style={{
            backgroundColor: colors.lineStrong,
            ...(s.axis === 'h'
              ? {
                  left: -120,
                  right: -120,
                  top: s.at,
                  height: s.thickness ?? 14,
                }
              : {
                  top: -120,
                  bottom: -120,
                  left: s.at,
                  width: s.thickness ?? 8,
                }),
            transform: [{ rotate: s.rotate }],
          }}
        />
      ))}
    </>
  )
}
