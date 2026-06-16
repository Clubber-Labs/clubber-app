import { useEffect } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { useCategories } from '@/shared/hooks/useCategories'
import { pruneIncoherentTags } from '@/shared/utils/taxonomy'
import { InterestGroup } from './InterestGroup'
import { colors } from '@/shared/theme'

type Props = {
  selectedCategories: string[]
  value: string[]
  onChange: (next: string[]) => void
  max?: number
}

// Seletor RESTRITO de interesses para evento/spot: só oferece subcategorias das
// categorias escolhidas e gêneros compatíveis (appliesTo). A coerência é
// garantida aqui para a UI nunca enviar uma combinação que o backend rejeita.
export function SubcategorySelect({
  selectedCategories,
  value,
  onChange,
  max = 10,
}: Props) {
  const {
    categories,
    genresFor,
    subgroupsFor,
    parentOf,
    genreAppliesTo,
    isLoading,
  } = useCategories()

  // Auto-cura: ao remover uma categoria, descarta subcategorias/gêneros órfãos
  // (cobre também a edição de evento — regra de coerência contra o estado final).
  // Só roda com a árvore carregada; senão parentOf/genreAppliesTo cairiam no
  // undefined e limpariam tudo indevidamente.
  useEffect(() => {
    if (categories.length === 0 || value.length === 0) return
    const pruned = pruneIncoherentTags(
      value,
      selectedCategories,
      genreAppliesTo,
      parentOf,
    )
    if (pruned.length !== value.length) onChange(pruned)
  }, [
    selectedCategories,
    value,
    categories.length,
    genreAppliesTo,
    parentOf,
    onChange,
  ])

  function toggle(itemValue: string) {
    if (value.includes(itemValue)) {
      onChange(value.filter(v => v !== itemValue))
      return
    }
    if (value.length >= max) return
    onChange([...value, itemValue])
  }

  if (isLoading && categories.length === 0) {
    return (
      <ActivityIndicator
        size="small"
        color={colors.brandEmphasis}
        className="self-start"
      />
    )
  }

  if (selectedCategories.length === 0) {
    return (
      <Text className="text-content-subtle text-xs">
        Escolha categorias para liberar interesses.
      </Text>
    )
  }

  const groups = subgroupsFor(selectedCategories)
  const genres = genresFor(selectedCategories)

  // Categorias escolhidas sem nenhum 2º nível disponível: não renderiza nada.
  if (groups.length === 0 && genres.length === 0) return null

  const atMax = value.length >= max

  return (
    <View className="gap-4">
      {groups.map(group => (
        <InterestGroup
          key={group.category.value}
          title={group.category.label}
          items={group.subs}
          selected={value}
          onToggle={toggle}
          atMax={atMax}
        />
      ))}
      <InterestGroup
        title="Gêneros musicais"
        items={genres}
        selected={value}
        onToggle={toggle}
        atMax={atMax}
      />
    </View>
  )
}
