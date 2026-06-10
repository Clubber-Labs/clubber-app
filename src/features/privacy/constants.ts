import { CONSENT_ITEMS } from './services/consentService'
import type { ConsentFields } from './services/consentService'

export const DEFAULT_CONSENT_FIELDS: ConsentFields = {
  locationPrecise: false,
  socialFeed: false,
  socialVisibility: false,
  pushNotifications: false,
  marketing: false,
  analytics: false,
  surveys: false,
}

export const ORDERED_CATEGORIES = [
  'location',
  'social',
  'notifications',
  'marketing',
  'analytics',
  'research',
] as const

export type ConsentCategory = (typeof ORDERED_CATEGORIES)[number]

export function groupItemsByCategory() {
  return ORDERED_CATEGORIES.reduce<Record<string, typeof CONSENT_ITEMS>>(
    (acc, cat) => {
      acc[cat] = CONSENT_ITEMS.filter(i => i.category === cat)
      return acc
    },
    {},
  )
}
