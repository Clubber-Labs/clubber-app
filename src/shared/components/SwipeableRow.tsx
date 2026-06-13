import { useRef } from 'react'
import type { ReactNode } from 'react'
import { Pressable } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import ReanimatedSwipeable, {
  type SwipeableMethods,
  SwipeDirection,
} from 'react-native-gesture-handler/ReanimatedSwipeable'
import { colors } from '@/shared/theme'

export type SwipeAction = {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
}

export type SwipeTrigger = {
  icon: keyof typeof Ionicons.glyphMap
  onTrigger: () => void
}

type Props = {
  children: ReactNode
  // Botões revelados ao arrastar para a esquerda (persistem até toque).
  rightActions?: SwipeAction[]
  // Gatilho "responder" ao arrastar para a ESQUERDA — dispara passando o limiar
  // e volta sozinho (sem revelar botões). Tem precedência sobre rightActions.
  rightTrigger?: SwipeTrigger
  // Gatilho "responder" ao arrastar para a DIREITA (mesma ideia, lado oposto).
  leftTrigger?: SwipeTrigger
}

function RightActions({
  progress,
  actions,
  onRun,
}: {
  progress: SharedValue<number>
  actions: SwipeAction[]
  onRun: (action: SwipeAction) => void
}) {
  // Ícones (brancos, sem fundo) só aparecem quando o swipe está quase completo.
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.7, 1], [0, 1], Extrapolation.CLAMP),
  }))

  return (
    <Animated.View style={style} className="flex-row items-center">
      {actions.map(action => (
        <Pressable
          key={action.label}
          onPress={() => onRun(action)}
          style={{ width: 32 }}
          className="items-center justify-center"
          accessibilityLabel={action.label}
        >
          <Ionicons name={action.icon} size={24} color={colors.content} />
        </Pressable>
      ))}
    </Animated.View>
  )
}

// Ícone único que surge ao arrastar (responder): aparece já no começo do gesto
// e cresce; a ação dispara ao soltar passando o limiar (ver onSwipeableOpen).
function TriggerIcon({
  progress,
  icon,
}: {
  progress: SharedValue<number>
  icon: keyof typeof Ionicons.glyphMap
}) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.2, 1], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0.2, 1],
          [0.6, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }))

  return (
    <Animated.View style={style} className="items-center justify-center px-5">
      <Ionicons name={icon} size={22} color={colors.brandEmphasis} />
    </Animated.View>
  )
}

// Arraste a linha para a esquerda para revelar as ações (botões que persistem
// até o toque) ou — com `rightTrigger` — para disparar uma ação única que volta
// sozinha. Fecha o swipe antes de disparar.
export function SwipeableRow({
  children,
  rightActions,
  rightTrigger,
  leftTrigger,
}: Props) {
  const ref = useRef<SwipeableMethods>(null)

  function run(action: SwipeAction) {
    ref.current?.close()
    action.onPress()
  }

  const renderRight = rightTrigger
    ? (progress: SharedValue<number>) => (
        <TriggerIcon progress={progress} icon={rightTrigger.icon} />
      )
    : rightActions
      ? (progress: SharedValue<number>) => (
          <RightActions
            progress={progress}
            actions={rightActions}
            onRun={run}
          />
        )
      : undefined

  const renderLeft = leftTrigger
    ? (progress: SharedValue<number>) => (
        <TriggerIcon progress={progress} icon={leftTrigger.icon} />
      )
    : undefined

  const hasTrigger = !!rightTrigger || !!leftTrigger

  return (
    <ReanimatedSwipeable
      ref={ref}
      friction={2}
      leftThreshold={leftTrigger ? 40 : undefined}
      rightThreshold={rightTrigger ? 40 : 48}
      overshootLeft={false}
      overshootRight={false}
      onSwipeableOpen={
        hasTrigger
          ? direction => {
              // `direction` é o sentido do ARRASTE: RIGHT (arrastou p/ direita,
              // abre o lado esquerdo) → leftTrigger; LEFT → rightTrigger.
              ref.current?.close()
              if (direction === SwipeDirection.RIGHT) leftTrigger?.onTrigger()
              else rightTrigger?.onTrigger()
            }
          : undefined
      }
      renderLeftActions={renderLeft}
      renderRightActions={renderRight}
    >
      {children}
    </ReanimatedSwipeable>
  )
}
