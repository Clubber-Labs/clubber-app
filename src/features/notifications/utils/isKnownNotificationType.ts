import {
  NOTIFICATION_TYPES,
  type NotificationType,
} from '../schemas/notificationSchema'

const KNOWN = new Set<string>(NOTIFICATION_TYPES)

// Único portão entre o `type` cru do servidor e o enum fechado: o backend
// publica antes do app, então tipo novo chega como string e só vira
// NotificationType depois daqui — os mapas por tipo seguem exaustivos.
export function isKnownNotificationType(
  type: string,
): type is NotificationType {
  return KNOWN.has(type)
}
