import type { UserProfile } from '@/shared/types'

// Regra de produto: todo usuário precisa de pelo menos 2 categorias de rolê — o
// perfil nunca pode ficar sem preferência. Vale no cadastro, no login social e
// na edição. O backend espelha a regra (rejeita < 2 com 400); o client bloqueia
// antes para o usuário nunca chegar a enviar.
export const MIN_PREFERRED_CATEGORIES = 2

// Tetos espelhados pelo backend. Moram aqui, e não soltos no schema, porque
// quem preenche o formulário por atalho (importar do Spotify) precisa parar no
// mesmo limite que a validação aplica — dois números separados divergiriam sem
// ninguém notar até o submit falhar.
export const MAX_PREFERRED_CATEGORIES = 10
export const MAX_PREFERRED_INTERESTS = 30

// true quando o perfil ainda não atingiu o mínimo de categorias de rolê. Trata
// o campo ausente (selects reduzidos) como 0 — nunca quebra.
export function needsRolePreferences(
  profile: Pick<UserProfile, 'preferredCategories'>,
): boolean {
  return (profile.preferredCategories?.length ?? 0) < MIN_PREFERRED_CATEGORIES
}
