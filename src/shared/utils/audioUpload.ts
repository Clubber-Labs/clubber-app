import type { ReactNativeFile } from './imageUpload'

// Monta o part `audio` do multipart a partir da uri do arquivo gravado. O gravador
// produz sempre `.m4a` (container AAC) nos dois SOs; o backend aceita audio/mp4,
// audio/m4a, audio/x-m4a e audio/aac. Usamos audio/mp4 (MIME canônico do m4a).
export function buildAudioFile(
  uri: string,
  fallback = 'audio.m4a',
): ReactNativeFile {
  const filename = uri.split('/').pop() ?? fallback
  const name = filename.toLowerCase().endsWith('.m4a') ? filename : fallback
  return { uri, name, type: 'audio/mp4' }
}
