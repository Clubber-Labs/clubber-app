import { useEffect, useRef } from 'react'
import { Image, View } from 'react-native'
import { captureRef } from 'react-native-view-shot'
import { colors } from '@/shared/theme'
import { USER_AVATAR_RING, USER_AVATAR_SIZE } from '../constants'

type Props = {
  avatarUrl?: string | null
  // file:// do PNG circular capturado; null sem foto ou em falha de captura.
  onCaptured: (uri: string | null) => void
}

const INNER_SIZE = USER_AVATAR_SIZE - USER_AVATAR_RING * 2

// Pré-renderiza o avatar do indicador de posição FORA do mapa: montado atrás
// do MapView (on-screen, então o onLoad da foto remota dispara de verdade),
// capturado via view-shot e entregue como arquivo pro registro nativo do
// Mapbox — o snapshot offscreen do <Mapbox.Image> perdia a foto no cold start.
export function UserAvatarIconCapture({ avatarUrl, onCaptured }: Props) {
  const viewRef = useRef<View>(null)

  useEffect(() => {
    if (!avatarUrl) onCaptured(null)
  }, [avatarUrl, onCaptured])

  if (!avatarUrl) return null

  function capture() {
    // rAF garante o frame com a foto já desenhada antes do snapshot.
    requestAnimationFrame(() => {
      captureRef(viewRef, { format: 'png', result: 'tmpfile' })
        .then(onCaptured)
        .catch(() => onCaptured(null))
    })
  }

  return (
    <View
      ref={viewRef}
      collapsable={false}
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: USER_AVATAR_SIZE,
        height: USER_AVATAR_SIZE,
        borderRadius: USER_AVATAR_SIZE / 2,
        borderWidth: USER_AVATAR_RING,
        borderColor: colors.content,
        backgroundColor: colors.content,
        overflow: 'hidden',
      }}
    >
      <Image
        source={{ uri: avatarUrl }}
        style={{
          width: INNER_SIZE,
          height: INNER_SIZE,
          borderRadius: INNER_SIZE / 2,
        }}
        onLoad={capture}
        onError={() => onCaptured(null)}
      />
    </View>
  )
}
