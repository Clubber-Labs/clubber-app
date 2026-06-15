import { View, Text, FlatList, Linking, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { RadiusSlider } from '@/shared/components/RadiusSlider'
import { useKeyboardSheetLift } from '@/shared/hooks/useKeyboardSheetLift'
import { isValidationError } from '@/shared/lib/apiError'
import type { useSuggestSpots } from '../hooks/useSuggestSpots'
import { SPOT_RADIUS_MIN_KM, SPOT_RADIUS_MAX_KM } from '../hooks/useSpotPrefs'
import { suggestionsErrorMessage } from '../utils/suggestionsError'
import { SpotSuggestionCard } from './SpotSuggestionCard'
import { SpotQueryInput } from './SpotQueryInput'
import type { SpotSuggestion } from '../types'
import { colors } from '@/shared/theme'

const LOCATION_ISSUE_MESSAGES = {
  denied:
    'Permissão de localização negada. Ative nos ajustes do aparelho para gerar sugestões.',
  error: 'Não foi possível obter sua localização. Tente novamente.',
} as const

type Props = {
  // O fluxo vive na tela do mapa — fechar o painel não descarta as sugestões
  // já geradas (nem gasta outra geração da quota ao reabrir).
  suggest: ReturnType<typeof useSuggestSpots>
  // Escolher (no card ou no rascunho do mapa) é orquestrado pela tela.
  onChoose: (suggestion: SpotSuggestion) => void
  onClose: () => void
}

// Painel da metade de baixo da tab do mapa: gera e lista as sugestões da IA
// enquanto os balões dos spots e os rascunhos continuam visíveis em cima.
export function SpotSuggestionsPanel({ suggest, onChoose, onClose }: Props) {
  const router = useRouter()
  // Levanta a folha acima do teclado no iOS (Android: adjustResize já resolve).
  const { ref: sheetRef, lift: keyboardLift } = useKeyboardSheetLift()
  const {
    hasLocationConsent,
    suggestions,
    remaining,
    hasGenerated,
    isGenerating,
    generateError,
    locationIssue,
    radiusKm,
    setRadiusKm,
    query,
    setQuery,
    hasValidQuery,
    handleGenerate,
  } = suggest

  // Só após uma geração que voltou vazia — no estado inicial a lista vazia é
  // esperada (ainda nem gerou). A IA descarta lugares ruins, então 0 é possível.
  const listEmpty =
    hasGenerated && !isGenerating ? (
      <View className="items-center gap-2 px-2 pt-6">
        <Ionicons
          name="sparkles-outline"
          size={28}
          color={colors.contentSubtle}
        />
        <Text className="text-content-tertiary text-sm font-semibold text-center">
          Nenhuma sugestão encontrada
        </Text>
        <Text className="text-content-muted text-sm text-center">
          A IA não achou bons lugares para essa busca. Tente aumentar o raio ou
          descreva o que você quer fazer.
        </Text>
      </View>
    ) : null

  const header = (
    <View className="gap-3 pb-4">
      <Text className="text-content-muted text-sm">
        A IA sugere rolês dentro do raio escolhido, com base nas suas
        preferências — ou no que você descrever. Escolha um, publique e chame a
        galera pro grupo.
      </Text>

      {!hasLocationConsent ? (
        <View className="bg-surface border border-line rounded-2xl p-4 gap-3">
          <View className="flex-row items-center gap-2">
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={colors.brandText}
            />
            <Text className="text-content-secondary text-sm font-semibold flex-1">
              Precisamos da sua localização
            </Text>
          </View>
          <Text className="text-content-muted text-sm">
            Para sugerir e mostrar rolês perto de você, ative o consentimento de
            localização precisa. Ela é usada só neste momento — nada de
            rastreamento em segundo plano.
          </Text>
          <Button
            label="Abrir configurações de privacidade"
            variant="secondary"
            onPress={() => router.push('/profile/privacy')}
          />
        </View>
      ) : (
        <View className="gap-3">
          <View className="gap-1">
            <RadiusSlider
              label="Raio da busca"
              min={SPOT_RADIUS_MIN_KM}
              max={SPOT_RADIUS_MAX_KM}
              value={radiusKm}
              onCommit={setRadiusKm}
              disabled={isGenerating}
            />
            <Text className="text-content-subtle text-xs">
              Vale só para esta busca — o raio padrão fica em Ajustes.
            </Text>
          </View>
          <SpotQueryInput
            value={query}
            onChange={setQuery}
            editable={!isGenerating}
          />
          <Button
            label={
              isGenerating
                ? 'Gerando sugestões...'
                : hasGenerated
                  ? 'Gerar novamente'
                  : 'Gerar sugestões'
            }
            onPress={handleGenerate}
            loading={isGenerating}
            // Quota zerada (conhecida após a 1ª geração): o aviso abaixo já
            // explica; clicável só renderia um 429 garantido.
            disabled={isGenerating || remaining === 0}
          />
          {remaining !== undefined && (
            <Text className="text-content-subtle text-xs text-center">
              {remaining === 0
                ? 'Você usou todas as gerações de hoje.'
                : `${remaining} ${remaining === 1 ? 'geração restante' : 'gerações restantes'} hoje`}
            </Text>
          )}
          {locationIssue && (
            <>
              <FormError message={LOCATION_ISSUE_MESSAGES[locationIssue]} />
              {locationIssue === 'denied' && (
                <Pressable onPress={() => Linking.openSettings()}>
                  <Text className="text-brand-text text-sm font-semibold text-center">
                    Abrir ajustes
                  </Text>
                </Pressable>
              )}
            </>
          )}
          {generateError && (
            <>
              <FormError message={suggestionsErrorMessage(generateError)} />
              {/* CTA de preferências só faz sentido no 400 SEM intenção — com
                  query válida o backend ignora preferências (não é a causa). */}
              {isValidationError(generateError) && !hasValidQuery && (
                <Pressable onPress={() => router.push('/profile/edit')}>
                  <Text className="text-brand-text text-sm font-semibold text-center">
                    Ajustar preferências
                  </Text>
                </Pressable>
              )}
            </>
          )}
        </View>
      )}
    </View>
  )

  return (
    <View
      ref={sheetRef}
      className="absolute left-0 right-0 max-h-[80%] bottom-0 bg-surface-sunken rounded-t-3xl border-t border-line"
      style={{ transform: [{ translateY: -keyboardLift }] }}
    >
      <View className="items-center pt-2 pb-1">
        <View className="w-10 h-1 bg-surface-high rounded-full" />
      </View>
      <View className="flex-row items-center justify-between px-5 pb-2">
        <Text className="text-content text-lg font-bold">Bora pra onde?</Text>
        <Pressable
          onPress={onClose}
          className="w-8 h-8 items-center justify-center"
          accessibilityLabel="Fechar sugestões"
        >
          <Ionicons name="close" size={22} color={colors.contentMuted} />
        </Pressable>
      </View>
      <FlatList
        // A folha tem teto (max-h); flexShrink deixa a lista encolher e rolar
        // dentro dele com muitos cards. Sem isto a lista estica a folha além da
        // tela e a virtualização não rola (flex-1 colaparia: base 0 em pai auto).
        style={{ flexShrink: 1 }}
        // Ordem ranqueada pela IA — renderiza como veio, sem reordenar.
        data={suggestions}
        keyExtractor={item => item.placeId}
        // O campo de intenção vive no header: sem isto, o 1º tap em "Gerar" com
        // o teclado aberto só fecharia o teclado em vez de disparar a geração.
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 24,
          gap: 12,
        }}
        ListHeaderComponent={header}
        ListEmptyComponent={listEmpty}
        renderItem={({ item, index }) => (
          <SpotSuggestionCard
            suggestion={item}
            rank={index + 1}
            onChoose={() => onChoose(item)}
          />
        )}
      />
    </View>
  )
}
