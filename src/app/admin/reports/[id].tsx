import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useBanner } from '@/shared/lib/banner'
import { useConfirm } from '@/shared/lib/confirm'
import { getApiError } from '@/shared/lib/apiError'
import { formatRelative } from '@/shared/utils/dateFormat'
import { useReport } from '@/features/reports/hooks/useReport'
import { useUpdateReport } from '@/features/reports/hooks/useUpdateReport'
import { useDeleteReport } from '@/features/reports/hooks/useDeleteReport'
import { useRemoveReportTarget } from '@/features/reports/hooks/useRemoveReportTarget'
import { ReportStatusBadge } from '@/features/reports/components/ReportStatusBadge'
import { ReportTargetSummary } from '@/features/reports/components/ReportTargetSummary'
import { ReportDetailActions } from '@/features/reports/components/ReportDetailActions'
import { REASON_LABELS } from '@/features/reports/utils/reportLabels'
import {
  reportTargetType,
  reportTargetTypeLabel,
} from '@/features/reports/utils/reportTarget'
import type { ReportStatus } from '@/features/reports/types'

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
      {children}
    </Text>
  )
}

export default function AdminReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const showBanner = useBanner()
  const confirm = useConfirm()

  const { data: report, isLoading, isError } = useReport(id)
  const updateReport = useUpdateReport(id)
  const deleteReport = useDeleteReport()
  const removeTarget = useRemoveReportTarget(id)

  function setStatus(status: ReportStatus) {
    updateReport.mutate(status, {
      onSuccess: () => showBanner('Denúncia atualizada.'),
      onError: e => showBanner(getApiError(e).message),
    })
  }

  async function handleDelete() {
    const ok = await confirm({
      title: 'Excluir denúncia',
      message: 'Esta ação remove a denúncia permanentemente.',
      confirmLabel: 'Excluir',
      destructive: true,
    })
    if (!ok) return
    deleteReport.mutate(id, {
      onSuccess: () => {
        showBanner('Denúncia excluída.')
        router.back()
      },
      onError: e => showBanner(getApiError(e).message),
    })
  }

  async function handleRemoveTarget() {
    if (!report) return
    const targetLabel = reportTargetTypeLabel(report).toLowerCase()
    const ok = await confirm({
      title: 'Remover conteúdo',
      message: `Esta ação remove o ${targetLabel} denunciado e marca a denúncia como resolvida com remoção.`,
      confirmLabel: 'Remover',
      destructive: true,
    })
    if (!ok) return
    removeTarget.mutate(undefined, {
      onSuccess: () => showBanner('Conteúdo removido.'),
      onError: e => showBanner(getApiError(e).message),
    })
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    )
  }

  if (isError || !report) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6 gap-3">
        <Text className="text-zinc-200 text-center">
          Não foi possível carregar a denúncia.
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-violet-400 font-semibold">Voltar</Text>
        </Pressable>
      </View>
    )
  }

  const reporterName = report.reporter
    ? `${report.reporter.name} ${report.reporter.lastname}`.trim()
    : null
  const targetType = reportTargetType(report)
  const canRemoveTarget =
    targetType === 'event' ||
    targetType === 'comment' ||
    targetType === 'message'
  const isPending =
    updateReport.isPending || deleteReport.isPending || removeTarget.isPending

  return (
    <ScrollView
      className="flex-1 bg-black"
      contentContainerStyle={{ padding: 16, gap: 16 }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-white text-2xl font-bold">Denúncia</Text>
        <ReportStatusBadge status={report.status} />
      </View>

      <ReportTargetSummary report={report} />

      <View className="gap-1">
        <SectionLabel>Motivo</SectionLabel>
        <Text className="text-zinc-100 text-base">
          {REASON_LABELS[report.reason]}
        </Text>
      </View>

      {!!report.details && (
        <View className="gap-1">
          <SectionLabel>Detalhes</SectionLabel>
          <Text className="text-zinc-200 text-sm leading-5">
            {report.details}
          </Text>
        </View>
      )}

      <View className="gap-1">
        <SectionLabel>Denúncia</SectionLabel>
        <Text className="text-zinc-300 text-sm">
          {reporterName ? `Por ${reporterName}` : 'Autor não informado'} ·{' '}
          {formatRelative(report.createdAt)}
        </Text>
      </View>

      <View className="h-px bg-zinc-800 my-1" />

      <ReportDetailActions
        status={report.status}
        onSetStatus={setStatus}
        onRemoveTarget={canRemoveTarget ? handleRemoveTarget : undefined}
        onDelete={handleDelete}
        isPending={isPending}
      />
    </ScrollView>
  )
}
