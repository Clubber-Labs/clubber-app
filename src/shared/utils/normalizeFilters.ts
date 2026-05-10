// Remove keys com undefined e arrays vazios pra evitar variações de
// queryKey que representam o mesmo filtro lógico (ex: {} vs {status: undefined}
// geram hashes diferentes no react-query → cache duplicado).
export function normalizeFilters<T extends Record<string, unknown>>(
  filters: T,
): Partial<T> {
  const out: Partial<T> = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined) continue
    if (Array.isArray(value) && value.length === 0) continue
    out[key as keyof T] = value as T[keyof T]
  }
  return out
}
