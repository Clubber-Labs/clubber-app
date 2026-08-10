import {
  UserPlusIcon,
  CheckIcon,
  EnvelopeIcon,
  ChatCircleIcon,
  HeartIcon,
  CheckCircleIcon,
  MapPinIcon,
  SparkleIcon,
  UsersIcon,
  ClockIcon,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import type { NotificationType } from '../schemas/notificationSchema'

// Tom semântico do selo/tile — a cor concreta vive no NotificationRow, pra
// manter este utilitário livre de presentation (className/hex).
export type NotificationTone = 'brand' | 'danger' | 'success' | 'warning'

export type NotificationVisual = { icon: Icon; tone: NotificationTone }

// Ícone + tom por tipo. Sociais (com actor) viram selo sobre o avatar; as de
// sistema (sem actor) viram tile de ícone. O ícone comunica a ação; o tom, a
// natureza — curtida = perigo, presença = sucesso, rolê expirando = aviso.
const VISUALS: Record<NotificationType, NotificationVisual> = {
  NEW_FOLLOWER: { icon: UserPlusIcon, tone: 'brand' },
  FOLLOW_REQUEST: { icon: UserPlusIcon, tone: 'brand' },
  FOLLOW_ACCEPTED: { icon: CheckIcon, tone: 'brand' },
  EVENT_INVITE: { icon: EnvelopeIcon, tone: 'brand' },
  EVENT_COMMENT: { icon: ChatCircleIcon, tone: 'brand' },
  POST_COMMENT: { icon: ChatCircleIcon, tone: 'brand' },
  EVENT_REACTION: { icon: HeartIcon, tone: 'danger' },
  POST_REACTION: { icon: HeartIcon, tone: 'danger' },
  COMMENT_REACTION: { icon: HeartIcon, tone: 'danger' },
  EVENT_ATTENDANCE: { icon: CheckCircleIcon, tone: 'success' },
  EVENT_NEARBY: { icon: MapPinIcon, tone: 'brand' },
  SPOT_NEARBY: { icon: SparkleIcon, tone: 'brand' },
  SPOT_JOIN: { icon: UsersIcon, tone: 'brand' },
  SPOT_RENEWAL: { icon: ClockIcon, tone: 'warning' },
}

export function notificationVisual(type: NotificationType): NotificationVisual {
  return VISUALS[type]
}
