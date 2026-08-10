import { useMemo, useState } from 'react'
import { View, Text } from 'react-native'
import { MapPinIcon } from 'phosphor-react-native'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { getApiError, isConflictError } from '@/shared/lib/apiError'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import { useCreateSpot } from '@/features/spots/hooks/useCreateSpot'
import { SpotForm } from '@/features/spots/components/SpotForm'
import { SpotLimitReached } from '@/features/spots/components/SpotLimitReached'
import type { CreateSpotInput } from '@/features/spots/schemas/createSpotSchema'
import type { SpotSuggestion } from '@/features/spots/types'
import { colors } from '@/shared/theme'

// Janela default = atalho "Agora · por 2h" do form (o usuário ajusta nos
// presets/pickers; o teto de 24h vive no schema e no picker).
const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000

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
    // A sugestão não traz mais categoria (era um palpite do tipo do Places). O
    // usuário confirma a categoria de verdade no SpotForm ao publicar.
    categories: [],
    subcategories: [],
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
  const { data: profile } = useMyProfile()
  const isPremium = !!profile?.isPremium
  const [submitError, setSubmitError] = useState<string | null>(null)
  // 409 (máx. de rolês ativos) abre o estado dedicado com upsell do Premium.
  const [limitReached, setLimitReached] = useState(false)

  // Sem candidato válido não há o que publicar (deep link malformado) —
  // volta pro mapa, onde fica o painel de sugestões.
  if (!candidate) return <Redirect href="/(tabs)/map" />

  function handleSubmit(data: CreateSpotInput) {
    setSubmitError(null)
    create.mutate(data, {
      onSuccess: spot => router.replace(`/spots/${spot.id}/created`),
      // 409 = máx. de rolês ativos → estado dedicado (com upsell do Premium);
      // 400 (janela/categorias) e demais ficam inline no form.
      onError: error => {
        if (isConflictError(error)) setLimitReached(true)
        else setSubmitError(getApiError(error).message)
      },
    })
  }

  if (limitReached) {
    return (
      <View className="flex-1 bg-background">
        <SpotLimitReached
          isPremium={isPremium}
          onUpgrade={() => router.push('/billing/upgrade')}
          onBack={() => router.back()}
        />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <SpotForm
        defaultValues={toDefaults(candidate)}
        onSubmit={handleSubmit}
        submitting={create.isPending}
        submitError={submitError}
        headerSection={
          <View className="bg-surface border border-line rounded-2xl p-3 flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-lg bg-brand-surface border border-brand-surface-strong items-center justify-center">
              <MapPinIcon weight="fill" size={20} color={colors.brandText} />
            </View>
            <View className="flex-1">
              <Text
                className="text-content text-base font-semibold"
                numberOfLines={1}
              >
                {candidate.name}
              </Text>
              {candidate.address && (
                <Text className="text-content-subtle text-xs" numberOfLines={1}>
                  {candidate.address}
                </Text>
              )}
            </View>
          </View>
        }
      />
    </View>
  )
}
