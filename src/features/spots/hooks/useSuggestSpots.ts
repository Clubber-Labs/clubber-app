import { useState } from 'react'
import {
  useConsentStore,
  selectCanUseLocation,
} from '@/features/privacy/store/consentStore'
import { getForegroundLocation } from '../lib/foregroundLocation'
import { useGenerateSuggestions } from './useGenerateSuggestions'

export type LocationIssue = 'denied' | 'error' | null

// Orquestra o fluxo do botão "gerar": gate de consentimento (LGPD) → posição
// foreground capturada NA HORA do tap (minimização: nada de stream/persistir)
// → mutation. O lock anti double-tap precisa cobrir o fluxo INTEIRO — a quota
// diária não pode ser queimada por toque duplo.
export function useSuggestSpots() {
  // Gate LGPD: sem consentimento de localização precisa, nem pede a permissão
  // do SO — a tela mostra o caminho pras configurações de privacidade.
  const hasLocationConsent = useConsentStore(selectCanUseLocation)
  const generate = useGenerateSuggestions()
  const [locationIssue, setLocationIssue] = useState<LocationIssue>(null)
  // isPending só vira true DEPOIS do mutate — e o fix de GPS que vem antes
  // pode levar segundos (sem modal segurando o toque a partir da 2ª geração).
  // Sem este lock, dois taps nessa janela passam o guard e queimam duas
  // gerações da quota.
  const [isCapturing, setIsCapturing] = useState(false)

  async function handleGenerate() {
    if (generate.isPending || isCapturing || !hasLocationConsent) return
    setIsCapturing(true)
    setLocationIssue(null)
    try {
      const location = await getForegroundLocation()
      if (location.kind !== 'granted') {
        setLocationIssue(location.kind)
        return
      }
      generate.mutate({
        latitude: location.latitude,
        longitude: location.longitude,
      })
    } finally {
      setIsCapturing(false)
    }
  }

  return {
    hasLocationConsent,
    suggestions: generate.data?.suggestions ?? [],
    remaining: generate.data?.remaining,
    // Captura de posição + request em voo — alimenta o disabled/loading do botão.
    isGenerating: generate.isPending || isCapturing,
    generateError: generate.error,
    locationIssue,
    handleGenerate,
  }
}
