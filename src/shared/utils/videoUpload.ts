import type { ReactNativeFile } from './imageUpload'

// Monta o `file` do upload de vídeo a partir da uri local. O MIME é derivado da
// extensão: a galeria/câmera do iOS produz `.mov` (QuickTime) e o Android `.mp4`;
// `.webm` raro mas possível. Default `video/mp4` quando a extensão é desconhecida.
export function buildVideoFile(
  uri: string,
  fallback = 'video.mp4',
): ReactNativeFile {
  const filename = uri.split('/').pop() ?? fallback
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'mp4'
  const type =
    ext === 'mov'
      ? 'video/quicktime'
      : ext === 'webm'
        ? 'video/webm'
        : 'video/mp4'
  return { uri, name: filename, type }
}
