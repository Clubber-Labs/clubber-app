import { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useReports } from '@/features/reports/hooks/useReports'
import { usePullRefresh } from '@/shared/hooks/usePullRefresh'
import { ReportStatusFilter } from '@/features/reports/components/ReportStatusFilter'
import { ReportListItem } from '@/features/reports/components/ReportListItem'
import type { ReportStatus } from '@/features/reports/types'

export default function AdminReportsScreen() {
  const router = useRouter()
  const [status, setStatus] = useState<ReportStatus | undefined>(undefined)
  const { data: reports, isLoading, isError, refetch } = useReports(status)
  const { refreshing, onRefresh } = usePullRefresh(refetch)

  return (
    <View className="flex-1 bg-black">
      <View className="px-4 pt-4 pb-3">
        <Text className="text-white text-2xl font-bold">
          Painel de moderação
        </Text>
        <Text className="text-zinc-400 text-sm mt-0.5">Fila de denúncias</Text>
      </View>

      <View className="pb-3">
        <ReportStatusFilter value={status} onChange={setStatus} />
      </View>

      <FlatList
        data={reports ?? []}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 12 }}
        renderItem={({ item }) => (
          <ReportListItem
            report={item}
            onPress={() => router.push(`/admin/reports/${item.id}`)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8b5cf6"
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color="#8b5cf6" style={{ marginTop: 32 }} />
          ) : isError ? (
            <Text className="text-zinc-500 text-center mt-8">
              Não foi possível carregar as denúncias.
            </Text>
          ) : (
            <Text className="text-zinc-500 text-center mt-8">
              Nenhuma denúncia encontrada.
            </Text>
          )
        }
      />
    </View>
  )
}
