import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Location from 'expo-location'
import * as Notifications from 'expo-notifications'

const ASKED_KEY = 'clubber-permissions-firstrun-v1'

/**
 * O que o pedido de primeiro uso ainda tem a oferecer.
 *
 * `ask` lista só o que o SO deixa perguntar: um "Ativar" em permissão já
 * concedida — ou negada de vez — não abre prompt nenhum, e o toque parece morto.
 */
export type FirstRunPermissionsDecision =
  | { kind: 'skip' }
  | { kind: 'ask'; push: boolean; location: boolean }

export async function decideFirstRunPermissions(): Promise<FirstRunPermissionsDecision> {
  const asked = await AsyncStorage.getItem(ASKED_KEY)
  if (asked) return { kind: 'skip' }

  const [push, location] = await Promise.all([
    Notifications.getPermissionsAsync(),
    Location.getForegroundPermissionsAsync(),
  ])
  const askPush = !push.granted && push.canAskAgain
  const askLocation = !location.granted && location.canAskAgain
  if (!askPush && !askLocation) return { kind: 'skip' }
  return { kind: 'ask', push: askPush, location: askLocation }
}

/**
 * Consome a única aparição. Gravado ao exibir, não ao fechar: quem viu e matou
 * o app no meio já gastou a chance — só reinstalar traz o pedido de volta.
 */
export const markFirstRunPermissionsAsked = () =>
  AsyncStorage.setItem(ASKED_KEY, '1')
