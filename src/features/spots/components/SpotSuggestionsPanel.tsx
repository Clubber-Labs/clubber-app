import { useState } from 'react'
import {
  Keyboard,
  TextInput,
  View,
  Text,
  FlatList,
  Linking,
  Pressable,
  useWindowDimensions,
} from 'react-native'
import {
  CaretLeftIcon,
  ArrowsClockwiseIcon,
  XIcon,
} from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { runOnJS } from 'react-native-worklets'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { RadiusSlider } from '@/shared/components/RadiusSlider'
import { useKeyboardOverlap } from '@/shared/hooks/useKeyboardOverlap'
import { useTabBarClearance } from '@/shared/hooks/useTabBarClearance'
import { useHeaderClearance } from '@/shared/hooks/useHeaderClearance'
import {
  isValidationError,
  isTooManyRequestsError,
} from '@/shared/lib/apiError'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import type { useSuggestSpots } from '../hooks/useSuggestSpots'
import { SPOT_RADIUS_MIN_KM, SPOT_RADIUS_MAX_KM } from '../hooks/useSpotPrefs'
import { suggestionsErrorMessage } from '../utils/suggestionsError'
import { SpotSuggestionCard } from './SpotSuggestionCard'
import { SpotConsentNeeded } from './SpotConsentNeeded'
import { SpotEmptyResults } from './SpotEmptyResults'
import { SpotQuotaExhausted } from './SpotQuotaExhausted'
import { SpotQueryInput } from './SpotQueryInput'
import type { SpotSuggestion } from '../types'
import { colors } from '@/shared/theme'

const LOCATION_ISSUE_MESSAGES = {
  denied:
    'Permissão de localização negada. Ative nos ajustes do aparelho para gerar sugestões.',
  error: 'Não foi possível obter sua localização. Tente novamente.',
} as const

// data vazio reutilizável — evita criar [] a cada render quando a cota esgotada
// substitui a lista pelo estado dedicado.
const NO_SUGGESTIONS: SpotSuggestion[] = []

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
//
// Dois modos pra folha não engolir o mapa (os pins ranqueados precisam aparecer):
//  - entrada: folha alta com os controles (raio + prompt + gerar);
//  - resultados: folha baixa (~meia-altura) só com a lista + cabeçalho compacto.
// "Gerar de novo" reabre os controles (com voltar) sem gastar outra geração.
export function SpotSuggestionsPanel({ suggest, onChoose, onClose }: Props) {
  const router = useRouter()
  const tabBarClearance = useTabBarClearance()
  const headerClearance = useHeaderClearance()
  const { height: windowHeight } = useWindowDimensions()
  // Mede quanto o teclado cobre da folha no iOS (Android: adjustResize já
  // resolve). A folha NÃO sobe: fica ancorada embaixo e passa por trás do
  // teclado — quem recua é só o conteúdo, via padding.
  const { ref: sheetRef, overlap: keyboardOverlap } = useKeyboardOverlap()
  // Volta pros controles depois de já ter resultados (ajustar raio/intenção).
  const [editing, setEditing] = useState(false)

  // Arrastar a alça pra baixo fecha a folha: segue o dedo; além do limiar (ou
  // num flick rápido), desliza pra fora e fecha; senão, volta com mola.
  const dragY = useSharedValue(0)
  const dragGesture = Gesture.Pan()
    .onUpdate(e => {
      dragY.value = Math.max(0, e.translationY)
    })
    .onEnd(e => {
      if (e.translationY > 120 || e.velocityY > 800) {
        dragY.value = withTiming(900, { duration: 200 }, finished => {
          if (finished) runOnJS(close)()
        })
      } else {
        dragY.value = withSpring(0, { damping: 22, stiffness: 220 })
      }
    })
  const sheetStyle = useAnimatedStyle(
    () => ({ transform: [{ translateY: dragY.value }] }),
    [],
  )

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

  const { data: profile } = useMyProfile()
  const isPremium = !!profile?.isPremium
  // Cota zerada nesta sessão (remaining 0) ou 429 de uma sessão anterior.
  const quotaExhausted =
    remaining === 0 || isTooManyRequestsError(generateError)

  const count = suggestions.length
  // Há resultados pra mostrar/voltar; durante a geração mantém os controles
  // (botão em loading) em vez de saltar pro modo resultados com a lista antiga.
  const canReturn = hasGenerated && count > 0
  const showResults = canReturn && !editing && !isGenerating
  // Cota esgotada toma a folha inteira (sem lista de sugestões embaixo) — só
  // entra no modo de entrada; com resultados à mostra o usuário ainda os vê.
  const showQuota = quotaExhausted && !showResults
  // Gerou e veio vazio: estado dedicado (igual cota/consentimento) no lugar dos
  // controles, até o usuário editar a busca.
  const showEmpty =
    hasLocationConsent &&
    !quotaExhausted &&
    hasGenerated &&
    count === 0 &&
    !isGenerating &&
    !editing
  // Qualquer estado dedicado esconde a intro (a folha foca no estado).
  const showTakeover = !hasLocationConsent || quotaExhausted || showEmpty

  // Solta o input focado ANTES de qualquer flip de estado: desmontar OU
  // tornar não-editável um TextInput focado deixa a lupa de seleção do iOS
  // órfã na tela (Keyboard.dismiss sozinho é assíncrono e perde a corrida
  // com o editable={false} do isGenerating). O blur explícito derruba a
  // lupa na hora.
  function releaseFocusedInput() {
    TextInput.State.currentlyFocusedInput()?.blur()
    Keyboard.dismiss()
  }

  // Gerar a partir dos controles fecha o modo edição: quando os resultados
  // voltam, a folha recolhe sozinha pro modo compacto.
  function submitGenerate() {
    releaseFocusedInput()
    setEditing(false)
    handleGenerate()
  }

  // Mesma razão no fechar (X, arraste, "ver mapa" da cota): a folha desmonta
  // inteira — input focado deixaria o loupe fantasma.
  function close() {
    releaseFocusedInput()
    onClose()
  }

  // Faixa de motivo do melhor match (assinatura da IA): a intenção digitada
  // quando há query válida; senão, as preferências de rolê do usuário.
  const bestReason = hasValidQuery
    ? `Sugerido pra você · ${query.trim()}`
    : 'Combina com seus rolês'

  const header = (
    <View className="gap-3 pb-0">
      {!showTakeover && (
        <Text className="text-content-muted text-sm">
          A IA sugere rolês dentro do raio escolhido, com base nas suas
          preferências — ou no que você descrever. Escolha um, publique e chame
          a galera pro grupo.
        </Text>
      )}

      {!hasLocationConsent ? (
        <SpotConsentNeeded
          onOpenPrivacy={() => router.push('/profile/privacy')}
        />
      ) : quotaExhausted ? (
        <SpotQuotaExhausted
          isPremium={isPremium}
          onUpgrade={() => router.push('/billing/upgrade')}
          onSeeMap={close}
        />
      ) : showEmpty ? (
        <SpotEmptyResults
          radiusKm={radiusKm}
          maxRadiusKm={SPOT_RADIUS_MAX_KM}
          onIncreaseRadius={km => {
            setRadiusKm(km)
            handleGenerate(km)
          }}
          onEditQuery={() => setEditing(true)}
        />
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
            onPress={submitGenerate}
            loading={isGenerating}
            // Quota zerada (conhecida após a 1ª geração): o aviso abaixo já
            // explica; clicável só renderia um 429 garantido.
            disabled={isGenerating || remaining === 0}
          />
          {remaining !== undefined && remaining > 0 && (
            <Text className="text-content-subtle text-xs text-center">
              {`${remaining} ${remaining === 1 ? 'geração restante' : 'gerações restantes'} hoje`}
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

  // A folha cresce pelo tanto que o teclado cobre: o trecho visível (acima do
  // teclado) continua sendo a mesma fração da tela, e o excedente é justamente
  // o que fica escondido atrás dele. Teto absoluto: o header flutuante.
  const baseMaxHeight =
    windowHeight * (showResults ? 0.55 : 0.85) + keyboardOverlap
  const sheetMaxHeight = Math.min(
    baseMaxHeight,
    Math.max(240, windowHeight - headerClearance),
  )

  return (
    <Animated.View
      ref={sheetRef}
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: sheetMaxHeight,
        },
        sheetStyle,
      ]}
    >
      {/* Folha sólida em surface + hairline, alinhada às SheetModal. O padding
          inferior tira o conteúdo de trás do que houver embaixo: a pílula
          flutuante com o teclado fechado, o próprio teclado com ele aberto — a
          superfície segue até a borda da tela nos dois casos. flexShrink (nunca
          flex: 1!): o pai tem altura automática com teto — base 0 colapsaria a
          folha, desalinhando o conteúdo e travando o scroll. */}
      <View
        className="bg-surface border-t border-white/10"
        style={{
          flexShrink: 1,
          paddingBottom:
            keyboardOverlap > 0 ? keyboardOverlap + 16 : tabBarClearance,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflow: 'hidden',
        }}
      >
        <GestureDetector gesture={dragGesture}>
          <View className="items-center pt-3 pb-3">
            <View className="w-10 h-1 bg-surface-high rounded-full" />
          </View>
        </GestureDetector>
        <View className="flex-row items-center justify-between px-5 pb-2">
          <View className="flex-row items-center gap-1.5 flex-1">
            {editing && canReturn && (
              <Pressable
                onPress={() => setEditing(false)}
                accessibilityRole="button"
                accessibilityLabel="Voltar para as sugestões"
                hitSlop={8}
              >
                <CaretLeftIcon size={22} color={colors.content} />
              </Pressable>
            )}
            <Text className="text-content text-lg font-bold">
              {showResults
                ? `${count} ${count === 1 ? 'rolê' : 'rolês'} pra hoje`
                : 'Bora pra onde?'}
            </Text>
          </View>
          <View className="flex-row items-center gap-4">
            {showResults && (
              <Pressable
                onPress={() => setEditing(true)}
                className="flex-row items-center gap-1.5"
                accessibilityRole="button"
                accessibilityLabel="Gerar de novo"
                hitSlop={8}
              >
                <ArrowsClockwiseIcon size={16} color={colors.brandText} />
                <Text className="text-brand-text text-sm font-semibold">
                  Gerar de novo
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={close}
              className="w-8 h-8 items-center justify-center"
              accessibilityLabel="Fechar sugestões"
            >
              <XIcon size={22} color={colors.contentMuted} />
            </Pressable>
          </View>
        </View>
        <FlatList
          // A folha tem teto (max-h); flexShrink deixa a lista encolher e rolar
          // dentro dele com muitos cards. Sem isto a lista estica a folha além da
          // tela e a virtualização não rola (flex-1 colaparia: base 0 em pai auto).
          style={{ flexShrink: 1 }}
          // Ordem ranqueada pela IA — renderiza como veio, sem reordenar. Na cota
          // esgotada a lista some: o estado dedicado (no header) toma a folha.
          data={showQuota ? NO_SUGGESTIONS : suggestions}
          keyExtractor={item => item.placeId}
          // O campo de intenção vive no header: sem isto, o 1º tap em "Gerar" com
          // o teclado aberto só fecharia o teclado em vez de disparar a geração.
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 24,
            gap: 12,
          }}
          // No modo resultados os controles somem — sobra só a lista compacta.
          ListHeaderComponent={showResults ? null : header}
          renderItem={({ item, index }) => (
            <SpotSuggestionCard
              suggestion={item}
              rank={index + 1}
              onChoose={() => onChoose(item)}
              reason={index === 0 ? bestReason : undefined}
            />
          )}
        />
      </View>
    </Animated.View>
  )
}
