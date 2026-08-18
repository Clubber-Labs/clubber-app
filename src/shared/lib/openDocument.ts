import * as WebBrowser from 'expo-web-browser'
import { colors } from '@/shared/theme'

/**
 * Abre um documento (Termos, Política) DENTRO do app — sheet no iOS, custom tab
 * no Android. Jogar a pessoa pro navegador no meio do cadastro é perdê-la: sai
 * do app, some o teclado, e voltar depende dela lembrar do multitarefa.
 *
 * Falha em silêncio de propósito: nenhum documento legal vale travar o fluxo.
 */
export function openDocument(url: string): void {
  WebBrowser.openBrowserAsync(url, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    toolbarColor: colors.background,
    controlsColor: colors.content,
  }).catch(() => {})
}
