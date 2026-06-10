// Coordenador "só um áudio toca por vez". Cada VoiceMessage registra seus controles
// ao dar play; o anterior é pausado. Singleton de módulo — estado efêmero de UI,
// não precisa de store.
type PlaybackControls = { pause: () => void }

let active: PlaybackControls | null = null

export function claimPlayback(controls: PlaybackControls): void {
  if (active && active !== controls) active.pause()
  active = controls
}

export function releasePlayback(controls: PlaybackControls): void {
  if (active === controls) active = null
}
