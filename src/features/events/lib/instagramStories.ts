import { Linking, Platform } from 'react-native'
import Constants from 'expo-constants'
import Share, { Social } from 'react-native-share'

// Única fronteira do app com a lib nativa de share. Quem chama isto lida com
// booleano, não com Intent/UIPasteboard.
const IOS_STORIES_SCHEME = 'instagram-stories://share'
const ANDROID_PACKAGE = 'com.instagram.android'

const facebookAppId = Constants.expoConfig?.extra?.facebookAppId as
  | string
  | undefined

// A resposta não muda enquanto o app vive (instalar o IG no meio da sessão é
// caso de borda), e a checagem cruza a ponte nativa — memoriza a promessa.
let availability: Promise<boolean> | null = null

async function probe(): Promise<boolean> {
  // Sem App ID o Instagram descarta o intent: melhor não oferecer a opção.
  if (!facebookAppId) return false
  try {
    if (Platform.OS === 'ios') {
      return await Linking.canOpenURL(IOS_STORIES_SCHEME)
    }
    const { isInstalled } = await Share.isPackageInstalled(ANDROID_PACKAGE)
    return isInstalled
  } catch {
    return false
  }
}

export function canShareToInstagramStories(): Promise<boolean> {
  availability = availability ?? probe()
  return availability
}

// `backgroundImage` ocupa o story inteiro e o usuário não a redimensiona.
// O link tocável (`linkUrl`) é restrito a parceiros da Meta — por isso a URL
// vai impressa na arte e o app copia pro clipboard; ver docs/share-stories-instagram.md.
export async function shareToInstagramStories(
  backgroundImageUri: string,
): Promise<boolean> {
  if (!facebookAppId) return false
  try {
    await Share.shareSingle({
      social: Social.InstagramStories,
      appId: facebookAppId,
      backgroundImage: backgroundImageUri,
    })
    return true
  } catch {
    // IG fechado, usuário cancelou, asset recusado — silencioso (padrão do app).
    return false
  }
}
