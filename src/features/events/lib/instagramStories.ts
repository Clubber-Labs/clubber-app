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
//
// iOS — o handoff da lib É o UIPasteboard (arte via setItems + openURL), e
// ficou PROVADO em aparelho (28/08/2026) que o Instagram LIMPA o pasteboard
// inteiro ao consumir a arte. Portanto: nunca copiar a URL antes do share (o
// setItems a apaga), nunca escrevê-la junto (morre na limpeza) e nunca tentar
// reescrever depois (escrita em background é no-op silencioso). A cópia do
// link acontece na VOLTA ao app, em primeiro plano — ver useShareToStories.
// Diagnóstico completo: docs/share-stories-instagram.md.
export async function shareToInstagramStories(
  backgroundImageUri: string,
  linkUrl: string,
): Promise<boolean> {
  if (!facebookAppId) return false
  try {
    await Share.shareSingle({
      social: Social.InstagramStories,
      appId: facebookAppId,
      backgroundImage: backgroundImageUri,
      // Sticker de link nativo — o mesmo mecanismo do Spotify. Campo original
      // da lib (`com.instagram.sharedSticker.linkURL` no iOS, extra `link_url`
      // no Android), restrito a parceiros da Meta: se um dia o programa abrir,
      // o story sai com CTA tocável sem mudança aqui. Ignorado (o caso de
      // hoje, provado em aparelho), o story sai só com a arte.
      linkUrl,
    })
    return true
  } catch {
    // IG ausente/fechado, usuário cancelou, asset recusado — silencioso
    // (padrão do app); o chamador decide o fallback.
    return false
  }
}

// Saída de emergência quando o handoff do IG não acontece: a mesma arte pelo
// share do sistema. Este caminho NÃO passa pelo pasteboard do Instagram, então
// a URL copiada antes dele sobrevive.
export async function shareStoryArtToSystem(
  imageUri: string,
): Promise<boolean> {
  try {
    const { success } = await Share.open({
      url: imageUri,
      // A captura sai em JPG (ver StoryArtCapture) — o mime errado faz o
      // destino tratar o arquivo como binário opaco.
      type: 'image/jpeg',
      failOnCancel: false,
    })
    return success
  } catch {
    return false
  }
}
