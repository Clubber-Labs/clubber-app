// Wrapper do Google Sign-In SDK.
//
// O backend valida o idToken contra GOOGLE_CLIENT_ID = Web Client ID — por isso
// passamos `webClientId` no configure() (e o SDK Android usa o mesmo valor como
// `serverClientId` pra emitir um idToken com `aud = Web Client ID` em vez do
// Android Client ID). Sem isso, o backend responde 401 "audience errada".
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin'
import Constants from 'expo-constants'

let configured = false

function ensureConfigured() {
  if (configured) return
  const webClientId = Constants.expoConfig?.extra?.googleWebClientId as
    | string
    | undefined
  const iosClientId = Constants.expoConfig?.extra?.googleIosClientId as
    | string
    | undefined

  if (!webClientId) {
    throw new Error(
      'GOOGLE_WEB_CLIENT_ID não configurado. Adicione em .env.local.',
    )
  }

  GoogleSignin.configure({
    webClientId,
    iosClientId,
    offlineAccess: false,
  })
  configured = true
}

export type GoogleSignInResult =
  | { kind: 'success'; idToken: string }
  | { kind: 'cancelled' }

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  ensureConfigured()
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
    const response = await GoogleSignin.signIn()
    const idToken =
      response.type === 'success'
        ? response.data.idToken
        : response.type === 'cancelled'
          ? null
          : null

    if (response.type === 'cancelled') return { kind: 'cancelled' }
    if (!idToken) {
      throw new Error('Google não retornou idToken.')
    }
    return { kind: 'success', idToken }
  } catch (error) {
    if (isCancellationError(error)) return { kind: 'cancelled' }
    throw error
  }
}

function isCancellationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const code = (error as { code?: string }).code
  return (
    code === statusCodes.SIGN_IN_CANCELLED ||
    code === statusCodes.IN_PROGRESS
  )
}

export async function signOutGoogle() {
  if (!configured) return
  try {
    await GoogleSignin.signOut()
  } catch {
    // sign-out falha não é crítico; sessão local já foi limpa
  }
}
