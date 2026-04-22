import { useState } from 'react'

type Options = {
  pageSize?: number
}

export function usePagination({ pageSize = 20 }: Options = {}) {
  const [page, setPage] = useState(1)

  const nextPage = () => setPage(p => p + 1)
  const prevPage = () => setPage(p => Math.max(1, p - 1))
  const reset = () => setPage(1)

  return { page, pageSize, nextPage, prevPage, reset }
}
