import { Modal, View, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useVideoPlayer, VideoView } from 'expo-video'

type Props = {
  url: string | null
  onClose: () => void
}

// Player full-screen, espelhando o ImageViewerModal. O corpo (que chama
// useVideoPlayer) fica num componente-filho montado só quando há url — assim o
// hook nunca roda atrás de um early-return, mantendo a ordem de hooks estável.
export function VideoPlayerModal({ url, onClose }: Props) {
  if (!url) return null
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        <PlayerBody url={url} />
        <Pressable
          onPress={onClose}
          className="absolute top-12 right-5 w-10 h-10 items-center justify-center bg-black/50 rounded-full"
          accessibilityLabel="Fechar vídeo"
        >
          <Ionicons name="close" size={24} color="#ffffff" />
        </Pressable>
      </View>
    </Modal>
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
