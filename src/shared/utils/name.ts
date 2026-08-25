// Regra de nome/sobrenome compartilhada por cadastro, complete profile e
// edição de perfil: palavras de letras separadas por UM espaço, sem espaço
// nas pontas. Os schemas fazem .trim() antes — o regex nunca vê as pontas.
export const NAME_REGEX = /^[a-zA-ZÀ-ÿ]+(?: [a-zA-ZÀ-ÿ]+)*$/

// Máscara do input: descarta o que não é letra e colapsa espaços repetidos.
// O espaço final fica — apagá-lo impediria digitar "Maria Luiza"; quem o
// remove do valor submetido é o .trim() dos schemas.
export function sanitizeName(text: string): string {
  return text
    .replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^ /, '')
}
