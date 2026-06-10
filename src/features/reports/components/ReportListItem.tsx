import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatRelative } from '@/shared/utils/dateFormat'
import { ReportStatusBadge } from './ReportStatusBadge'
import { REASON_LABELS } from '../utils/reportLabels'
import {
  reportTargetPreview,
  reportTargetTypeLabel,
} from '../utils/reportTarget'
import type { Report } from '../types'

type Props = {
  report: Report
  onPress: () => void
}

// Linha da fila de moderação: motivo + status, alvo e prévia, denunciante e
// quando. Toque abre o detalhe.
export function ReportListItem({ report, onPress }: Props) {
  const preview = reportTargetPreview(report)
  const reporterName = report.reporter
    ? `${report.reporter.name} ${report.reporter.lastname}`.trim()
    : null

  return (
    <Pressable
      onPress={onPress}
      className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 active:bg-zinc-800"
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-white font-semibold text-base">
          {REASON_LABELS[report.reason]}
        </Text>
        <ReportStatusBadge status={report.status} />
      </View>

      <View className="flex-row items-center gap-1.5">
        <Ionicons name="pricetag-outline" size={13} color="#a78bfa" />
        <Text className="text-violet-300 text-xs font-medium">
          {reportTargetTypeLabel(report)}
        </Text>
      </View>

      {!!preview && (
        <Text className="text-zinc-300 text-sm mt-1" numberOfLines={2}>
          {preview}
        </Text>
      )}

      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-zinc-500 text-xs" numberOfLines={1}>
          {reporterName ? `Por ${reporterName}` : 'Denúncia'}
        </Text>
        <Text className="text-zinc-500 text-xs">
          {formatRelative(report.createdAt)}
        </Text>
      </View>
    </Pressable>
  )
}
