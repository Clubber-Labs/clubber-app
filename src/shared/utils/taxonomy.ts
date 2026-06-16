// Coerência da taxonomia de 2 níveis, isolada como decisão pura (sem efeitos).
// As regras vivem aqui; a árvore vem do useCategories e é injetada via callbacks
// — assim não há nenhuma categoria/gênero hardcodado no app.

/**
 * Mantém apenas as tags (subcategorias/gêneros) coerentes com as categorias
 * selecionadas. Espelha a regra do backend para o cliente nunca enviar uma
 * combinação que resultaria em 400:
 *
 * - **Gênero** → coerente se ao menos uma das suas categorias (`appliesTo`)
 *   estiver selecionada.
 * - **Subcategoria de venue** → coerente se a categoria-pai estiver selecionada.
 *
 * Tags não reconhecidas pela árvore (nem gênero nem subcategoria conhecida) são
 * descartadas — conservador por design. Só chamar com a árvore já carregada.
 */
export function pruneIncoherentTags(
  tags: string[],
  categories: string[],
  genreAppliesTo: (value: string) => string[] | undefined,
  parentOf: (value: string) => string | undefined,
): string[] {
  return tags.filter(tag => {
    const appliesTo = genreAppliesTo(tag)
    if (appliesTo)
      return appliesTo.some(category => categories.includes(category))
    const parent = parentOf(tag)
    return parent !== undefined && categories.includes(parent)
  })
}
