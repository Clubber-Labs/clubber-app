import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  categoriesService,
  CATEGORIES_LOCALE,
} from '@/shared/services/categoriesService'
import type { Category } from '@/shared/types'

/**
 * Fonte única dos rótulos de categoria. Consome GET /categories e expõe um
 * lookup value→label. A lista é canônica e estável, então cacheia "para
 * sempre" (revalidar só ao trocar de idioma, hoje fixo em pt-BR).
 */
export function useCategories() {
  const query = useQuery({
    queryKey: ['categories', CATEGORIES_LOCALE],
    queryFn: () => categoriesService.list(),
    staleTime: Infinity,
    gcTime: Infinity,
  })

  const categories: Category[] = useMemo(
    () => query.data?.data ?? [],
    [query.data],
  )

  const labels = useMemo(
    () => new Map(categories.map(c => [c.value, c.label])),
    [categories],
  )

  // Fallback para o próprio value se o mapa ainda não tem a categoria (cache
  // desatualizado vs. nova categoria no backend) — nunca quebra a renderização.
  const labelFor = useCallback(
    (value: string) => labels.get(value) ?? value,
    [labels],
  )

  // Junta os rótulos de várias categorias num texto único (ex.: "Festa, Música")
  // para linhas de resumo onde não cabe uma pílula por categoria.
  const labelsFor = useCallback(
    (values: string[]) => values.map(labelFor).join(', '),
    [labelFor],
  )

  return { categories, labelFor, labelsFor, isLoading: query.isLoading }
}
