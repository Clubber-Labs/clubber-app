import { useEffect } from 'react'
import { useVideoPlayer, VideoView } from 'expo-video'
import { Gesture } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { MediaViewerModal } from '@/shared/components/MediaViewerModal'
import { useSwipeToDismiss } from '@/shared/hooks/useSwipeToDismiss'

type Props = {
  url: string | null
  onClose: () => void
}

// Player full-screen: arrastar na vertical fecha (useSwipeToDismiss), espelhando
// o ImageViewerModal. Os hooks de dismiss ficam antes do early-return pra manter
// a ordem estável; o corpo que chama useVideoPlayer fica num filho montado só
// quando há url.
export function VideoPlayerModal({ url, onClose }: Props) {
  const { translateY, reset, applyDrag, release, bgStyle } = useSwipeToDismiss()

  // Reseta o transform a cada vídeo aberto.
  useEffect(() => {
    reset()
  }, [url, reset])

  // activeOffsetY: só dispara após um arraste vertical claro — tap (play/pause)
  // passa pros controles nativos. failOffsetX: arraste horizontal (seek) cancela
  // o dismiss e fica pro nativo.
  const pan = Gesture.Pan()
    .activeOffsetY([-15, 15])
    .failOffsetX([-15, 15])
    .onUpdate(e => applyDrag(e.translationY))
    .onEnd(e => release(e.translationY, onClose))

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  if (!url) return null

  return (
    <MediaViewerModal
      gesture={pan}
      bgStyle={bgStyle}
      closeLabel="Fechar vídeo"
      onClose={onClose}
    >
      <Animated.View className="flex-1" style={contentStyle}>
        <PlayerBody url={url} />
      </Animated.View>
    </MediaViewerModal>
  )
}

// `url` já vem assinada do backend — tocada como veio, sem reconstruir/cachear.
function PlayerBody({ url }: { url: string }) {
  const player = useVideoPlayer(url, p => {
    p.loop = false
    p.play()
  })
  return (
    <VideoView
      player={player}
      style={{ flex: 1 }}
      nativeControls
      fullscreenOptions={{ enable: true }}
      contentFit="contain"
    />
  )
}
