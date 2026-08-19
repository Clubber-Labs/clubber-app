import { Image, View } from 'react-native'

// Overlay de boot (_layout): a MESMA imagem que o SO já está mostrando na splash
// nativa, não uma recomposição dela. Recompor com BrandSticker + BrandWordmark
// parecia mais correto (vetor em vez de raster), mas punha dois motores de
// layout — RN e o Chrome que gera o PNG — pra desenhar a mesma arte: eles
// discordam no posicionamento da caixa de texto, e com o wordmark alinhado pela
// base isso deslocava a linha inteira. Com o raster compartilhado a igualdade é
// por construção, e a arte deixa de depender da fonte ter carregado.
//
// 320 é o lado do artboard (BOARD em scripts/splash-spec.mjs) e o mesmo
// imageWidth que o plugin usa no nativo — é o que faz as duas terem tamanho
// idêntico. Não dá pra importar de lá: o spec é .mjs da raiz, fora do src.
const SIZE = 320

export function SplashScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Image
        source={require('../../../assets/splash-logo.png')}
        style={{ width: SIZE, height: SIZE }}
      />
    </View>
  )
}
