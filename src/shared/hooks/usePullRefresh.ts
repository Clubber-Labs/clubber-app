import { useCallback, useState } from 'react'

// `isRefetching` do TanStack também fica true em invalidações automáticas, o
// que faz o spinner do RefreshControl aparecer após mutations. Este hook
// rastreia só o pull manual.
export function usePullRefresh(refetch: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }, [refetch])

  return { refreshing, onRefresh }
}
