import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { useFonts, Sora_700Bold } from '@expo-google-fonts/sora'
import { captureRef } from 'react-native-view-shot'
import { StoryArtTemplate } from './StoryArtTemplate'
import type { StoryArtData } from './StoryArtTemplate'
import {
  STORY_CANVAS,
  STORY_HEIGHT_DP,
  STORY_WIDTH_DP,
} from '../../lib/storyCanvas'

type Props = {
  data: StoryArtData
  // file:// do JPG 1080×1920; null em qualquer falha de captura.
  onCaptured: (uri: string | null) => void
}

// Monta a arte fora da área visível e a entrega como arquivo. Fica montada só
// enquanto há um compartilhamento em curso — quem controla isso é o
// useShareToStories.
export function StoryArtCapture({ data, onCaptured }: Props) {
  const viewRef = useRef<View>(null)
  const captured = useRef(false)
  const [drawn, setDrawn] = useState(false)

  // A arte só se declara pronta quando o flyer carrega E o título é medido. Se
  // um dos dois nunca responder (rede pendurada), captura mesmo assim: sem
  // isso o compartilhamento fica preso em "preparando" pra sempre, e a arte
  // provisória é melhor que nada acontecer.
  useEffect(() => {
    const timer = setTimeout(() => setDrawn(true), 2500)
    return () => clearTimeout(timer)
  }, [])
  // A Sora é carregada no _layout, mas o template sai sem o wordmark e com o
  // título em fonte de fallback se a captura ganhar essa corrida.
  const [fontsLoaded, fontError] = useFonts({ Sora_700Bold })

  useEffect(() => {
    if (captured.current || !drawn || !(fontsLoaded || fontError)) return
    captured.current = true
    // O rAF garante o frame com o flyer já desenhado antes do snapshot.
    requestAnimationFrame(() => {
      captureRef(viewRef, {
        // O caminho Android da lib manda o asset como image/jpeg — PNG entraria
        // com o mime errado. JPG também poupa memória num bitmap 1080×1920.
        format: 'jpg',
        quality: 0.95,
        result: 'tmpfile',
        width: STORY_CANVAS.width,
        height: STORY_CANVAS.height,
      })
        .then(onCaptured)
        .catch(() => onCaptured(null))
    })
  }, [drawn, fontError, fontsLoaded, onCaptured])

  return (
    <View
      ref={viewRef}
      collapsable={false}
      pointerEvents="none"
      style={{
        position: 'absolute',
        // Fora da tela em vez de opacity 0: no Android a captura de uma view
        // transparente sai em branco.
        left: -STORY_WIDTH_DP - 1,
        top: 0,
        width: STORY_WIDTH_DP,
        height: STORY_HEIGHT_DP,
      }}
    >
      <StoryArtTemplate data={data} onReady={() => setDrawn(true)} />
    </View>
  )
}
