import { useUserLocation } from '@/shared/hooks/useUserLocation'
import { useConsentStore, selectCanUseLocation } from '../store/consentStore'

/**
 * Localização amarrada ao consentimento de localização precisa.
 *
 * Enquanto ele estiver desligado o app não consulta o sistema — é o que a tela
 * de consentimento promete ("Usamos sua posição em tempo real para exibir
 * eventos próximos...") e o que useLocationSync e useSuggestSpots já faziam.
 * Existe como ponto único de composição pra nenhum componente precisar ler o
 * store de consentimento por conta própria.
 */
export function useConsentedLocation() {
  const allowed = useConsentStore(selectCanUseLocation)
  return useUserLocation(allowed)
}
