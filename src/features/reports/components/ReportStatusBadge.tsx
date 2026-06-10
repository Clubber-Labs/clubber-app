import { View, Text } from 'react-native'
import { STATUS_COLORS, STATUS_LABELS } from '../utils/reportLabels'
import type { ReportStatus } from '../types'

type Props = {
  status: ReportStatus
}

// Badge colorido por status. Cores dinâmicas por status ficam em style inline
// (fora do alcance das classes estáticas do NativeWind).
export function ReportStatusBadge({ status }: Props) {
  const { text, bg } = STATUS_COLORS[status]
  return (
    <View
      className="self-start rounded-full px-2.5 py-0.5"
      style={{ backgroundColor: bg }}
    >
      <Text className="text-xs font-semibold" style={{ color: text }}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  )
}
