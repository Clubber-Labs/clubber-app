export type ReactNativeFile = { uri: string; name: string; type: string }

declare global {
  interface FormData {
    append(name: string, value: ReactNativeFile): void
  }
}

// O backend valida o Content-Type declarado contra uma allowlist (jpeg/png/webp)
// e recusa gif de propósito. Rotular tudo como jpeg burlaria a allowlist e o
// gif entraria achatado — o mapa diz a verdade, e a recusa vem com o código
// certo (UNSUPPORTED_IMAGE_FORMAT).
const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
}

const DEFAULT_MIME = 'image/jpeg'

export function buildImageFile(
  uri: string,
  fallback = 'image.jpg',
): ReactNativeFile {
  const filename = uri.split('/').pop() ?? fallback
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg'
  return { uri, name: filename, type: MIME_BY_EXTENSION[ext] ?? DEFAULT_MIME }
}
