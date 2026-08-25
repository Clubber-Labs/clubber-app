// Regra de nome/sobrenome compartilhada por cadastro, complete profile e
// edição de perfil: palavras de letras separadas por UM espaço, sem espaço
// nas pontas. Os schemas fazem .trim() antes — o regex nunca vê as pontas.
// A classe pula U+00D7 (×) e U+00F7 (÷), os dois não-letra no meio de À-ÿ.
export const NAME_REGEX = /^[a-zA-ZÀ-ÖØ-öø-ÿ]+(?: [a-zA-ZÀ-ÖØ-öø-ÿ]+)*$/

// Máscara do input: descarta o que não é letra e colapsa espaços repetidos.
// O espaço final fica — apagá-lo impediria digitar "Maria Luiza"; quem o
// remove do valor submetido é o .trim() dos schemas.
export function sanitizeName(text: string): string {
  return text
    .replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^ /, '')
}
