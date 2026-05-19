// Wrapper do Facebook Login SDK.
//
// Settings.initializeSDK() é chamado uma vez no _layout.tsx; aqui só usamos
// LoginManager + AccessToken. O access token (não o id token) é o que vai pro
// backend — o backend chama a Graph API do Facebook pra validar.
import { AccessToken, LoginManager, Settings } from 'react-native-fbsdk-next'

let initialized = false

export function initFacebookSDK() {
  if (initialized) return
  Settings.initializeSDK()
  initialized = true
}

export type FacebookLoginResult =
  | { kind: 'success'; accessToken: string }
  | { kind: 'cancelled' }
  | { kind: 'missing_email' }

export async function signInWithFacebook(): Promise<FacebookLoginResult> {
  initFacebookSDK()

  const result = await LoginManager.logInWithPermissions([
    'email',
    'public_profile',
  ])

  if (result.isCancelled) return { kind: 'cancelled' }

  const granted = result.grantedPermissions ?? []
  if (!granted.includes('email')) {
    await LoginManager.logOut()
    return { kind: 'missing_email' }
  }

  const tokenData = await AccessToken.getCurrentAccessToken()
  if (!tokenData?.accessToken) {
    throw new Error('Facebook não retornou access token.')
  }

  return { kind: 'success', accessToken: tokenData.accessToken }
}

export async function signOutFacebook() {
  try {
    await LoginManager.logOut()
  } catch {
    // sign-out falha não é crítico
  }
}
