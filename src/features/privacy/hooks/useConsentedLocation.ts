import {
  useUserLocation,
  type LocationStatus,
} from '@/shared/hooks/useUserLocation'
import { useConsentStore, selectConsentRevoked } from '../store/consentStore'

export type ConsentedLocationStatus = LocationStatus | 'revoked'

/**
 * Posição do usuário respeitando a revogação do Art. 18.
 *
 * A permissão do SO é a fonte da verdade sobre o dispositivo, mas ela não
 * desfaz uma revogação: quem revogou e depois reativou a permissão nos Ajustes
 * continua revogado até religar algo no app. Por isso 'revoked' é um estado
 * próprio — mandar essa pessoa pros ajustes do sistema não resolveria nada.
 */
export function useConsentedLocation(): {
  coords: [number, number] | null
  status: ConsentedLocationStatus
  request: () => Promise<LocationStatus>
} {
  const revoked = useConsentStore(selectConsentRevoked)
  const { coords, status, request } = useUserLocation()

  if (revoked) return { coords: null, status: 'revoked', request }
  return { coords, status, request }
}
