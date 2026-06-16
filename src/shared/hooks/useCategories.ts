import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  categoriesService,
  CATEGORIES_LOCALE,
} from '@/shared/services/categoriesService'
import type { Category, Genre, Subcategory } from '@/shared/types'

/**
 * Fonte única da taxonomia. Consome GET /categories e expõe lookups de rótulo e
 * de estrutura (categorias → subcategorias, gêneros e seus `appliesTo`). A lista
 * é canônica e estável, então cacheia "para sempre" (revalidar só ao trocar de
 * idioma, hoje fixo em pt-BR).
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

  const genres: Genre[] = useMemo(() => query.data?.genres ?? [], [query.data])

  // Mapa de rótulos cobrindo os TRÊS níveis (categoria, subcategoria, gênero):
  // qualquer chave da taxonomia resolve para o label localizado. CategoryBadge e
  // afins passam a exibir subcategorias/gêneros sem nenhuma mudança neles.
  const labels = useMemo(() => {
    const map = new Map<string, string>()
    for (const category of categories) {
      map.set(category.value, category.label)
      for (const sub of category.subcategories ?? [])
        map.set(sub.value, sub.label)
    }
    for (const genre of genres) map.set(genre.value, genre.label)
    return map
  }, [categories, genres])

  // subcategoria → categoria-pai, montado pela árvore (não por prefixo de string).
  const parents = useMemo(() => {
    const map = new Map<string, string>()
    for (const category of categories)
      for (const sub of category.subcategories ?? [])
        map.set(sub.value, category.value)
    return map
  }, [categories])

  // gênero → appliesTo[]. A presença no mapa também sinaliza "é gênero".
  const genreApplies = useMemo(
    () => new Map(genres.map(g => [g.value, g.appliesTo])),
    [genres],
  )

  // Fallback para o próprio value se o mapa ainda não tem a chave (cache
  // desatualizado vs. nova taxonomia no backend) — nunca quebra a renderização.
  const labelFor = useCallback(
    (value: string) => labels.get(value) ?? value,
    [labels],
  )

  // Junta os rótulos de várias chaves num texto único (ex.: "Festa, Funk") para
  // linhas de resumo onde não cabe uma pílula por item.
  const labelsFor = useCallback(
    (values: string[]) => values.map(labelFor).join(', '),
    [labelFor],
  )

  const parentOf = useCallback((value: string) => parents.get(value), [parents])

  const genreAppliesTo = useCallback(
    (value: string) => genreApplies.get(value),
    [genreApplies],
  )

  // Gating dinâmico: um gênero aparece quando ao menos uma categoria do seu
  // appliesTo está selecionada. Sem lista de "vida noturna" hardcoded no app.
  const genresFor = useCallback(
    (selectedCategories: string[]) =>
      genres.filter(g =>
        g.appliesTo.some(category => selectedCategories.includes(category)),
      ),
    [genres],
  )

  // Grupos de subcategorias só das categorias passadas (ordem da árvore),
  // omitindo categorias sem subcategorias. Para o seletor de evento/spot.
  const subgroupsFor = useCallback(
    (categoryValues: string[]): { category: Category; subs: Subcategory[] }[] =>
      categories
        .filter(category => categoryValues.includes(category.value))
        .map(category => ({ category, subs: category.subcategories ?? [] }))
        .filter(group => group.subs.length > 0),
    [categories],
  )

  return {
    categories,
    genres,
    labelFor,
    labelsFor,
    parentOf,
    genreAppliesTo,
    genresFor,
    subgroupsFor,
    isLoading: query.isLoading,
  }
}
