// Limites do username, iguais aos do backend (createUserSchema e a rota de
// disponibilidade). Vivem aqui porque o schema do cadastro (features/auth) e a
// checagem em tempo real (features/users) precisam concordar: se divergirem, o
// app consulta um valor que o cadastro recusa, ou deixa de consultar um válido.
export const USERNAME_MIN_LENGTH = 4
export const USERNAME_MAX_LENGTH = 25

export function hasValidUsernameFormat(username: string): boolean {
  return (
    username.length >= USERNAME_MIN_LENGTH &&
    username.length <= USERNAME_MAX_LENGTH
  )
}
