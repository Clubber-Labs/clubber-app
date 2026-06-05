import { View } from 'react-native'

type Props = {
  // Alturas das barras, 0..255.
  values: number[]
  height?: number
  barWidth?: number
  gap?: number
  // 0..1: barras até esse ponto usam activeColor (progresso de reprodução).
  progress?: number
  color?: string
  activeColor?: string
  minBarHeight?: number
}

// Renderiza barras de uma waveform. Usada tanto no preview ao vivo da gravação
// quanto na bolha de reprodução (com progresso).
export function Waveform({
  values,
  height = 28,
  barWidth = 3,
  gap = 2,
  progress,
  color = '#a1a1aa',
  activeColor,
  minBarHeight = 3,
}: Props) {
  const count = values.length
  return (
    <View className="flex-row items-center" style={{ height }}>
      {values.map((value, index) => {
        const barHeight = Math.max(minBarHeight, (value / 255) * height)
        const played =
          progress != null && count > 0 && (index + 1) / count <= progress
        return (
          <View
            key={index}
            style={{
              height: barHeight,
              width: barWidth,
              marginHorizontal: gap / 2,
              borderRadius: barWidth,
              backgroundColor: played && activeColor ? activeColor : color,
            }}
          />
        )
      })}
    </View>
  )
}
