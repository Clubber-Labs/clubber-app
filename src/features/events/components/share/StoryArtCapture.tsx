import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { useFonts, Sora_700Bold } from '@expo-google-fonts/sora'
import { captureRef } from 'react-native-view-shot'
import { StoryArtTemplate } from './StoryArtTemplate'
import type { StoryArtData } from './StoryArtTemplate'
import { STORY_HEIGHT_DP, STORY_WIDTH_DP } from '../../lib/storyCanvas'

// Longe o bastante pra sair da tela a partir de QUALQUER pai — ver o comentário
// no estilo abaixo.
const OFFSCREEN_LEFT = -9999

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
        // O padrão do iOS é drawViewHierarchyInRect, que renderiza A PARTIR DA
        // TELA: com a arte fora dela, a captura voltaria em branco. Esta opção
        // troca pelo renderInContext, que desenha a camada direto.
        useRenderInContext: true,
        // SEM width/height de propósito. As duas estratégias tratam essas
        // opções de formas diferentes: drawViewHierarchyInRect ESCALA a view
        // pro retângulo pedido, renderInContext desenha no tamanho natural e
        // deixa o resto do quadro vazio — pedir 1080 aqui punha a arte num
        // canto de uma tela 3x maior. Sem elas, o contexto nasce do tamanho da
        // view na escala do aparelho, e é por isso que a view é medida em
        // 1080/PixelRatio: dá 1080×1920 reais em qualquer densidade.
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
        //
        // Constante grande, e não -STORY_WIDTH_DP: `absolute` posiciona pelo
        // PAI, e este componente é montado na linha de ações do header, colada
        // na direita da tela — deslocar só a largura da arte a deixava visível
        // no meio da tela antes de o Instagram abrir.
        left: OFFSCREEN_LEFT,
        top: 0,
        width: STORY_WIDTH_DP,
        height: STORY_HEIGHT_DP,
      }}
    >
      <StoryArtTemplate data={data} onReady={() => setDrawn(true)} />
    </View>
  )
}
