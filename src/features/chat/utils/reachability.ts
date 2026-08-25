import type { PickablePerson } from '../types'

// Espelha o `canChatWith` do backend: perfil público é livre; privado exige
// follow MÚTUO aceito — seguir de mão única não basta em nenhuma das direções.
//
// `isPrivate` ausente (backend anterior ao campo) conta como público: esconder
// todo mundo seria pior que deixar o 403 do POST falar. Bloqueio nunca é
// previsível pelo cliente, de propósito.
export function isReachable(person: PickablePerson): boolean {
  if (!person.isPrivate) return true
  return person.followStatus === 'ACCEPTED' && person.followsYou === true
}
