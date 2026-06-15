import { useState } from 'react'
import {
  useConsentStore,
  selectCanUseLocation,
} from '@/features/privacy/store/consentStore'
import { getForegroundLocation } from '../lib/foregroundLocation'
import { useGenerateSuggestions } from './useGenerateSuggestions'
import { useSpotPrefs } from './useSpotPrefs'

export type LocationIssue = 'denied' | 'error' | null

// Texto livre só vira `query` a partir daqui — abaixo disso o backend rejeita e
// o sentido fica ambíguo. Espelha o min do contrato (max é o maxLength do input).
export const MIN_QUERY_LENGTH = 3

// Orquestra o fluxo do botão "gerar": gate de consentimento (LGPD) → posição
// foreground capturada NA HORA do tap (minimização: nada de stream/persistir)
// → mutation. O lock anti double-tap precisa cobrir o fluxo INTEIRO — a quota
// diária não pode ser queimada por toque duplo.
export function useSuggestSpots() {
  // Gate LGPD: sem consentimento de localização precisa, nem pede a permissão
  // do SO — a tela mostra o caminho pras configurações de privacidade.
  const hasLocationConsent = useConsentStore(selectCanUseLocation)
  const generate = useGenerateSuggestions()
  // Raio salvo do usuário (fonte da verdade); o override abaixo é só desta busca.
  const { spotRadiusKm } = useSpotPrefs()
  const [locationIssue, setLocationIssue] = useState<LocationIssue>(null)
  // isPending só vira true DEPOIS do mutate — e o fix de GPS que vem antes
  // pode levar segundos (sem modal segurando o toque a partir da 2ª geração).
  // Sem este lock, dois taps nessa janela passam o guard e queimam duas
  // gerações da quota.
  const [isCapturing, setIsCapturing] = useState(false)
  // null = segue o raio salvo; ao arrastar o slider vira override por geração.
  const [radiusOverride, setRadiusKm] = useState<number | null>(null)
  const [query, setQuery] = useState('')

  const radiusKm = radiusOverride ?? spotRadiusKm
  const trimmedQuery = query.trim()
  // Intenção válida = ignora preferências no backend. Por isso o botão "gerar"
  // NÃO exige preferências configuradas no client: quem decide é o servidor
  // (aceita com query; responde 400 sem query e sem preferências).
  const hasValidQuery = trimmedQuery.length >= MIN_QUERY_LENGTH

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
        // radiusKm é OVERRIDE: só vai quando o usuário mexeu no slider. Sem
        // override o backend usa o raio salvo — evita mandar o default (antes de
        // /users/me hidratar) e sobrescrever o valor real do usuário naquela busca.
        ...(radiusOverride !== null ? { radiusKm: radiusOverride } : {}),
        ...(hasValidQuery ? { query: trimmedQuery } : {}),
      })
    } finally {
      setIsCapturing(false)
    }
  }

  return {
    hasLocationConsent,
    suggestions: generate.data?.suggestions ?? [],
    remaining: generate.data?.remaining,
    // Distingue "ainda não gerou" de "gerou e veio vazio" (estado vazio na lista).
    hasGenerated: generate.isSuccess,
    // Captura de posição + request em voo — alimenta o disabled/loading do botão.
    isGenerating: generate.isPending || isCapturing,
    generateError: generate.error,
    locationIssue,
    radiusKm,
    setRadiusKm,
    query,
    setQuery,
    // Painel usa pra suprimir o CTA "Ajustar preferências" num 400 com intenção.
    hasValidQuery,
    handleGenerate,
  }
}
