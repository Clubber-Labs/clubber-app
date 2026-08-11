import { useEffect, useState } from 'react'
import { View, Text, Pressable, useWindowDimensions } from 'react-native'
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated'
import { runOnJS } from 'react-native-worklets'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '@/features/auth/store/authStore'
import { saveOnboardingSeen } from '@/shared/lib/secureStore'
import { BrandSticker } from '@/shared/components/brand'
import { SLIDES } from '@/features/onboarding/slides'
import { ART_BOX } from '@/features/onboarding/constants'
import { SlideFrame } from '@/features/onboarding/components/SlideFrame'
import { OnboardingFooter } from '@/features/onboarding/components/OnboardingFooter'

// Tela do onboarding: pager + header + CTAs. As artes/animações de cada slide
// vivem em features/onboarding (components/slides + slides.ts). Todo o
// scroll-driven (crossfade dos slides, troca de CTA) roda no thread de UI —
// a versão JS-driven derrubava frames durante o arrasto.
export default function OnboardingScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const [page, setPage] = useState(0)
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const scrollX = useSharedValue(0)
  const lastIdx = SLIDES.length - 1
  const setOnboardingSeen = useAuthStore(s => s.setOnboardingSeen)

  // Visto uma vez neste aparelho: deslogado passa a cair direto no login.
  // Marcado no mount (não no fim) — quem pulou também "viu".
  useEffect(() => {
    setOnboardingSeen(true)
    void saveOnboardingSeen()
  }, [setOnboardingSeen])

  // page (estado React) só muda no fim do gesto — o meio do arrasto é 100%
  // shared value, sem re-render por frame.
  function settlePage(offsetX: number) {
    setPage(Math.round(offsetX / width))
  }

  const onScroll = useAnimatedScrollHandler({
    onScroll: e => {
      scrollX.value = e.contentOffset.x
    },
    onMomentumEnd: e => {
      runOnJS(settlePage)(e.contentOffset.x)
    },
  })

  return (
    <View className="flex-1 bg-background">
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {SLIDES.map(({ art: Art, title, body, fullBleed }, i) => (
          <View key={body} style={{ width }}>
            <SlideFrame index={i} width={width} scrollX={scrollX}>
              {/* Mapa full-bleed atrás do texto; no fluxo entra um espaçador
                  do mesmo tamanho do bloco de arte pra manter o texto alinhado
                  com os outros slides. */}
              {fullBleed && <Art active={i === page} />}
              <View className="flex-1 items-center justify-center px-8 gap-8">
                {fullBleed ? (
                  <View style={{ height: ART_BOX.height }} />
                ) : (
                  <Art active={i === page} />
                )}
                <View className="gap-3">
                  {!!title && (
                    <Text className="text-5xl font-bold text-content text-center">
                      {title}
                    </Text>
                  )}
                  <Text className="text-xl text-content-muted text-center leading-6">
                    {body}
                  </Text>
                </View>
              </View>
            </SlideFrame>
          </View>
        ))}
      </Animated.ScrollView>

      {/* Header por cima do mapa full-bleed dos slides 2/3. O paddingTop
          compensa a safe area (o _layout libera o inset nesta rota pro mapa
          passar sob a status bar/Dynamic Island). */}
      <View
        className="absolute left-0 right-0 flex-row items-center justify-between px-6"
        style={{ top: 0, zIndex: 10, paddingTop: insets.top + 8 }}
      >
        <BrandSticker size={40} />
        <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={8}>
          <Text className="text-content-subtle font-medium">Pular</Text>
        </Pressable>
      </View>

      <View className="px-6 pb-10">
        <OnboardingFooter
          scrollX={scrollX}
          width={width}
          lastIdx={lastIdx}
          page={page}
          onNext={() =>
            scrollRef.current?.scrollTo({
              x: width * (page + 1),
              animated: true,
            })
          }
          onRegister={() => router.replace('/(auth)/register')}
          onLogin={() => router.replace('/(auth)/login')}
        />
      </View>
    </View>
  )
}
