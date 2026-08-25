// Limites do username, iguais aos do backend (createUserSchema e a rota de
// disponibilidade). Vivem aqui porque o schema do cadastro (features/auth) e a
// checagem em tempo real (features/users) precisam concordar: se divergirem, o
// app consulta um valor que o cadastro recusa, ou deixa de consultar um válido.
export const USERNAME_MIN_LENGTH = 4
export const USERNAME_MAX_LENGTH = 25

// Formato estilo Instagram: minúsculas, dígitos, '.' e '_'; ponto não inicia,
// não termina e não repete. Só lookahead — Hermes não suporta lookbehind.
export const USERNAME_REGEX = /^[a-z0-9_](?:[a-z0-9_]|\.(?=[a-z0-9_]))*$/

// Máscara do input: minúsculas, acentos viram a letra base ("João" → "joao") e
// o resto (espaços inclusive) é descartado. As regras de posição do ponto ficam
// pro Zod — apagá-las na digitação impediria estados intermediários ("joao.").
export function sanitizeUsername(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, '')
}

export function hasValidUsernameFormat(username: string): boolean {
  return (
    username.length >= USERNAME_MIN_LENGTH &&
    username.length <= USERNAME_MAX_LENGTH &&
    USERNAME_REGEX.test(username)
  )
}
