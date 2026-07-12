import { useEffect, useRef, useState } from 'react'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { uuidv4 } from '@/shared/utils/uuid'
import {
  placesService,
  type PlaceDetails,
  type VenueSuggestion,
} from '../services/placesService'

const MIN_QUERY_LENGTH = 3
const DEBOUNCE_MS = 500

// 'unavailable' cobre 502/503 (e qualquer falha de rede): a busca cai em
// silêncio pro fluxo de endereço manual, sem bloquear a criação do evento.
export type VenueSearchStatus = 'idle' | 'searching' | 'unavailable'

export function useVenueSearch(coords: [number, number] | null) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<VenueSuggestion[]>([])
  const [status, setStatus] = useState<VenueSearchStatus>('idle')

  // Um token por sessão de digitação: o mesmo vai em todas as chamadas de
  // autocomplete e no getDetails final, fechando a sessão como cobrança única.
  const sessionTokenRef = useRef<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const debounced = useDebounce(query.trim(), DEBOUNCE_MS)

  function ensureSession() {
    if (!sessionTokenRef.current) sessionTokenRef.current = uuidv4()
    return sessionTokenRef.current
  }

  useEffect(() => {
    abortRef.current?.abort()

    // Espelha a validação do backend (400 abaixo de 3 chars): nem chama.
    if (debounced.length < MIN_QUERY_LENGTH) {
      setSuggestions([])
      setStatus('idle')
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    const sessionToken = ensureSession()
    setStatus('searching')

    placesService
      .autocomplete({
        q: debounced,
        coords,
        sessionToken,
        signal: controller.signal,
      })
      .then(res => {
        if (controller.signal.aborted) return
        setSuggestions(res.suggestions)
        setStatus('idle')
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setSuggestions([])
        setStatus('unavailable')
      })

    return () => controller.abort()
  }, [debounced, coords])

  async function selectPlace(placeId: string): Promise<PlaceDetails> {
    const details = await placesService.getDetails(placeId, ensureSession())
    resetSession()
    return details
  }

  // Fecha a sessão (escolha/limpeza): a próxima digitação gera um token novo.
  function resetSession() {
    abortRef.current?.abort()
    sessionTokenRef.current = null
    setQuery('')
    setSuggestions([])
    setStatus('idle')
  }

  return { query, setQuery, suggestions, status, selectPlace, resetSession }
}
