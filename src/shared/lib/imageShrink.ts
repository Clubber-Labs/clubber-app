import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'

/**
 * Teto do lado maior. É o mesmo que o backend usa pra caber a imagem em
 * 1920x1080 antes de reencodar em WebP: mandar mais que isso gasta o dado de
 * quem posta pra jogar pixel fora do outro lado — e é o que faz a foto de uma
 * câmera de 48 MP estourar o teto de 5 MB do upload e não subir.
 */
const MAX_EDGE = 1920
const QUALITY = 0.8

export type PickedImage = { uri: string; width: number; height: number }

/**
 * Reduz a foto escolhida ao que o servidor de fato vai guardar. De quebra
 * resolve a orientação: o reencode grava os pixels já girados, sem depender da
 * tag EXIF que o formato de saída pode não carregar.
 */
export async function shrinkForUpload({
  uri,
  width,
  height,
}: PickedImage): Promise<string> {
  const longest = Math.max(width, height)
  // Sem dimensão conhecida não dá pra dizer qual lado limitar; já pequena, não
  // há o que ganhar reencodando.
  if (!longest || longest <= MAX_EDGE) return uri

  try {
    const context = ImageManipulator.manipulate(uri)
    // Um lado só — o outro sai por proporção. Limitar o MAIOR é o que garante o
    // teto tanto em retrato quanto em paisagem.
    context.resize(width >= height ? { width: MAX_EDGE } : { height: MAX_EDGE })
    const image = await context.renderAsync()
    const result = await image.saveAsync({
      format: SaveFormat.JPEG,
      compress: QUALITY,
    })
    return result.uri
  } catch {
    // Não conseguiu redimensionar: sobe o original. Pode passar do teto e falhar
    // no servidor, mas aí a tela mostra o motivo — melhor que não enviar nada.
    return uri
  }
}
