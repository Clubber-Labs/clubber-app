// Avaliação de força de senha — função pura, reutilizada pelo schema Zod (fonte
// única da política) e pelo medidor visual. Sem side-effects, sem I/O.

// Backend valida 8..72 (72 = teto do bcrypt; acima disso ele trunca em silêncio).
export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 72

// Senhas óbvias mais comuns em PT-BR/EN; bloqueadas independente do resto.
const COMMON_WEAK_PASSWORDS = [
  '12345678',
  '123456789',
  '1234567890',
  'password',
  'password1',
  'senha123',
  'senha1234',
  'qwerty123',
  'abcd1234',
  'iloveyou',
  'admin123',
]

export type PasswordChecks = {
  length: boolean
  lettersAndNumbers: boolean
  notObvious: boolean
}

export type PasswordStrength = {
  score: number // 0..4
  label: 'fraca' | 'média' | 'forte'
  checks: PasswordChecks
}

function emailLocalPart(email?: string): string | null {
  const local = email?.split('@')[0]?.trim().toLowerCase()
  return local && local.length >= 3 ? local : null
}

function isObvious(password: string, email?: string): boolean {
  const lower = password.toLowerCase()
  if (COMMON_WEAK_PASSWORDS.includes(lower)) return true
  // Um único caractere repetido (ex.: '00000000', 'aaaaaaaa').
  if (/^(.)\1+$/.test(password)) return true
  const local = emailLocalPart(email)
  return local !== null && lower.includes(local)
}

export function evaluatePasswordStrength(
  password: string,
  email?: string,
): PasswordStrength {
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)

  const checks: PasswordChecks = {
    length:
      password.length >= MIN_PASSWORD_LENGTH &&
      password.length <= MAX_PASSWORD_LENGTH,
    lettersAndNumbers: hasLetter && hasNumber,
    notObvious: password.length > 0 && !isObvious(password, email),
  }

  let score = 0
  if (checks.length) score++
  if (checks.lettersAndNumbers) score++
  if (checks.notObvious) score++
  // Bônus: senha longa com símbolo é mais forte que o mínimo exigido.
  if (password.length >= 12 && /[^a-zA-Z0-9]/.test(password)) score++

  const label = score <= 1 ? 'fraca' : score === 2 ? 'média' : 'forte'
  return { score, label, checks }
}

// Predicado único da política — usado pelo Zod e pelo medidor pra não divergirem.
export function isStrongPassword(password: string, email?: string): boolean {
  const { checks } = evaluatePasswordStrength(password, email)
  return checks.length && checks.lettersAndNumbers && checks.notObvious
}
