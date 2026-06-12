import { useMutation } from '@tanstack/react-query'
import { spotsService } from '../services/spotsService'

// Geração consome quota diária (429 quando estoura) — sem retry e o caller
// desabilita o botão via isPending (lock contra double-tap).
export function useGenerateSuggestions() {
  return useMutation({
    mutationFn: (coords: { latitude: number; longitude: number }) =>
      spotsService.generateSuggestions(coords),
    retry: false,
  })
}
