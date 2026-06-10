import * as Notifications from 'expo-notifications'

let configured = false

// Política de dedup WS×push: o handler do expo-notifications só roda com o app
// em FOREGROUND — e aí quem entrega é o WS (lista e badge ao vivo). Banner do
// SO seria duplicado, então é sempre suprimido. O payload do push não carrega
// o id da notificação, logo dedup por id é impossível; suprimir por estado de
// foreground é a política. Com o app fechado/background o SO exibe o push
// normalmente (este handler não participa).
export function configureNotificationHandler() {
  if (configured) return
  configured = true
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  })
}
