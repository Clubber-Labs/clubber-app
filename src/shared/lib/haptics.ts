import * as Haptics from 'expo-haptics'

// Wrapper defensivo: cada chamada é fire-and-forget e engole erro. Se o módulo
// nativo ainda não estiver linkado (antes do prebuild) ou indisponível no
// device, vira no-op silencioso — feedback tátil nunca quebra o fluxo de UI.
export function hapticLight() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
}

export function hapticSuccess() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => {},
  )
}

export function hapticSelection() {
  Haptics.selectionAsync().catch(() => {})
}
