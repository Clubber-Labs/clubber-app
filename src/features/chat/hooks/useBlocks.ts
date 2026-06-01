import { useMemo } from 'react'
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { flattenInfiniteList } from '@/shared/utils/infiniteList'
import { blocksService } from '../services/blocksService'
import { chatKeys } from './cacheKeys'

export function useBlocks() {
  const query = useInfiniteQuery({
    queryKey: chatKeys.blocks,
    queryFn: ({ pageParam }) => blocksService.list({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: last => last.nextCursor ?? null,
  })

  const blocks = useMemo(() => flattenInfiniteList(query.data), [query.data])
  return { ...query, blocks }
}

export function useBlockUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => blocksService.block(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.blocks })
    },
  })
}

export function useUnblockUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => blocksService.unblock(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.blocks })
    },
  })
}
