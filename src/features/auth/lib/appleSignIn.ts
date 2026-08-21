import * as AppleAuthentication from 'expo-apple-authentication'
import type { SocialFullName } from '../schemas/socialLoginSchema'

export type AppleSignInResult =
  | { kind: 'success'; identityToken: string; fullName: SocialFullName | null }
  | { kind: 'cancelled' }

export async function signInWithApple(): Promise<AppleSignInResult> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    })

    if (!credential.identityToken) {
      throw new Error('Apple não retornou identityToken.')
    }

    // A Apple só entrega o nome no PRIMEIRO consentimento (e fora do
    // identityToken); nos logins seguintes fullName vem vazio. null = não
    // enviar o campo pro backend, que preserva o nome já cadastrado.
    const { givenName = null, familyName = null } = credential.fullName ?? {}
    const fullName = givenName || familyName ? { givenName, familyName } : null

    return {
      kind: 'success',
      identityToken: credential.identityToken,
      fullName,
    }
  } catch (error) {
    if (isCancellationError(error)) return { kind: 'cancelled' }
    throw error
  }
}

function isCancellationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  return (error as { code?: string }).code === 'ERR_REQUEST_CANCELED'
}
