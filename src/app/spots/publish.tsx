import { useMemo, useState } from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { getApiError } from '@/shared/lib/apiError'
import { useCreateSpot } from '@/features/spots/hooks/useCreateSpot'
import { SpotForm } from '@/features/spots/components/SpotForm'
import {
  SPOT_MAX_WINDOW_MS,
  type CreateSpotInput,
} from '@/features/spots/schemas/createSpotSchema'
import type { SpotSuggestion } from '@/features/spots/types'

// O rolê vive 24h por vez (renovável) — a janela default é o ciclo inteiro,
// ajustável nos pickers (teto de agora+24h no schema e no picker).
const DEFAULT_DURATION_MS = SPOT_MAX_WINDOW_MS

function parseCandidate(raw: string | undefined): SpotSuggestion | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as SpotSuggestion
    if (!parsed.placeId || typeof parsed.latitude !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

function toDefaults(candidate: SpotSuggestion): Partial<CreateSpotInput> {
  const now = Date.now()
  return {
    // Copy da IA pré-preenchida — o usuário edita à vontade.
    title: candidate.suggestedTitle,
    description: candidate.suggestedDescription ?? '',
    categories: [candidate.category],
    visibility: 'PUBLIC',
    placeId: candidate.placeId,
    latitude: candidate.latitude,
    longitude: candidate.longitude,
    startsAt: new Date(now),
    endsAt: new Date(now + DEFAULT_DURATION_MS),
  }
}

export default function PublishSpotScreen() {
  const router = useRouter()
  const { candidate: rawCandidate } = useLocalSearchParams<{
    candidate: string
  }>()
  const candidate = useMemo(() => parseCandidate(rawCandidate), [rawCandidate])
  const create = useCreateSpot()
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Sem candidato válido não há o que publicar (deep link malformado) —
  // volta pro mapa, onde fica o painel de sugestões.
  if (!candidate) return <Redirect href="/(tabs)/map" />

  function handleSubmit(data: CreateSpotInput) {
    setSubmitError(null)
    create.mutate(data, {
      onSuccess: spot => router.replace(`/spots/${spot.id}`),
      // 409 = máx. 5 spots ativos; 400 = janela/categorias inválidas. A
      // decisão é do backend — só refletimos a mensagem.
      onError: error => setSubmitError(getApiError(error).message),
    })
  }

  return (
    <View className="flex-1 bg-black">
      <SpotForm
        defaultValues={toDefaults(candidate)}
        onSubmit={handleSubmit}
        submitting={create.isPending}
        submitError={submitError}
        headerSection={
          <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 gap-1">
            <View className="flex-row items-center gap-2">
              <Ionicons name="location" size={16} color="#a78bfa" />
              <Text className="text-white text-base font-semibold flex-1">
                {candidate.name}
              </Text>
            </View>
            {candidate.address && (
              <Text className="text-zinc-500 text-xs">{candidate.address}</Text>
            )}
          </View>
        }
      />
    </View>
  )
}
