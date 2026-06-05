import {
  RecordingPresets,
  AudioQuality,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  type RecordingOptions,
} from 'expo-audio'

// Bloqueia notas acidentais (toque rápido no mic) e respeita o limite do backend.
export const MIN_AUDIO_DURATION_MS = 300
export const MAX_AUDIO_DURATION_MS = 600_000 // 10 min

// HIGH_QUALITY garante o container .m4a/AAC nos dois SOs (iOS MPEG4AAC, Android
// mpeg4+aac). Afinamos pra voz — mono e ~64kbps — porque o stereo 128kbps do
// preset estoura o teto de 5MB do backend por volta dos 5min; com mono/64kbps os
// 10min completos ficam ~4.8MB, dentro do limite. O container continua .m4a.
export const VOICE_RECORDING_OPTIONS: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
  numberOfChannels: 1,
  bitRate: 64_000,
  ios: {
    ...RecordingPresets.HIGH_QUALITY.ios,
    audioQuality: AudioQuality.MEDIUM,
  },
}

// Garante permissão de microfone. Retorna false quando negada (com ou sem chance
// de pedir de novo) — o chamador decide o feedback.
export async function ensureRecordingPermission(): Promise<boolean> {
  const current = await getRecordingPermissionsAsync()
  if (current.granted) return true
  if (!current.canAskAgain) return false
  const requested = await requestRecordingPermissionsAsync()
  return requested.granted
}
