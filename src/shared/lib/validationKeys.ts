import { i18n } from '@/shared/i18n'

// Mensagem de schema Zod guarda a CHAVE, não a frase: `z.string().min(4, '...')`
// é avaliado no import do módulo, então traduzir ali congelaria o idioma no
// boot. A tradução acontece na hora de exibir (ver messagesFromErrors).
//
// Consequência: o número que aparece na frase ("Máximo 11 dígitos") deixou de
// ser derivado da constante do schema (PHONE_MAX_DIGITS). Mudar um limite exige
// mudar a copy nos três dicionários — o typecheck não pega isso.
export const VALIDATION_KEYS = [
  'auth.errors.nameMin',
  'auth.errors.nameMax',
  'auth.errors.lastnameMin',
  'auth.errors.lastnameMax',
  'auth.errors.lettersOnly',
  'auth.errors.birthdateRequired',
  'auth.errors.minimumAge',
  'auth.errors.usernameMin',
  'auth.errors.usernameMax',
  'auth.errors.emailInvalid',
  'auth.errors.phoneMin',
  'auth.errors.phoneMax',
  'auth.errors.digitsOnly',
  'auth.errors.passwordMin',
  'auth.errors.passwordConfirm',
  'auth.errors.passwordMismatch',
  'auth.errors.bioMax',
  'auth.errors.categoriesMin',
  'auth.errors.categoriesMax',
  'auth.errors.subcategoriesMax',
  'auth.errors.identifierRequired',
  'auth.errors.loginPasswordMin',
  'auth.errors.codeSixDigits',
  'auth.errors.newPasswordRequired',
  'auth.errors.passwordMax',
  'auth.errors.newPasswordConfirm',
  'auth.errors.passwordWeak',
  'spots.errors.titleMin',
  'spots.errors.titleMax',
  'spots.errors.descriptionMax',
  'spots.errors.categoriesMin',
  'spots.errors.categoriesMax',
  'spots.errors.subcategoriesMax',
  'spots.errors.startsAtRequired',
  'spots.errors.endsAtRequired',
  'spots.errors.endsAfterStart',
  'spots.errors.endsInFuture',
  'spots.errors.windowTooLong',
] as const

export type ValidationKey = (typeof VALIDATION_KEYS)[number]

function isValidationKey(message: string): message is ValidationKey {
  return (VALIDATION_KEYS as readonly string[]).includes(message)
}

// Schema ainda não migrado devolve a frase pronta — passa direto, sem virar
// chave inexistente na tela.
export function translateValidationMessage(message: string): string {
  return isValidationKey(message) ? i18n.t(message) : message
}
