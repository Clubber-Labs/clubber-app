// Converte um nível de áudio em dBFS (metering, ~-60..0) para amplitude 0..1.
// Silêncio (≤ floor) → 0; pico (0 dB) → 1.
export function meterToAmplitude(db: number, floorDb = -60): number {
  if (!Number.isFinite(db)) return 0
  const clamped = Math.max(floorDb, Math.min(0, db))
  return (clamped - floorDb) / -floorDb
}

// Reduz as amostras de nível coletadas durante a gravação (uma por tick do
// metering, em dBFS) a um array de inteiros 0..255 com no máximo `maxBars` itens
// — o formato que o backend espera no campo `waveform` (máx. 512). Faz downsample
// por média de buckets; retorna [] se não houver amostras (metering indisponível).
export function buildWaveform(samplesDb: number[], maxBars = 48): number[] {
  if (samplesDb.length === 0) return []
  const bars = Math.min(maxBars, samplesDb.length)
  const bucketSize = samplesDb.length / bars
  const out: number[] = []
  for (let i = 0; i < bars; i++) {
    const start = Math.floor(i * bucketSize)
    const end = Math.max(start + 1, Math.floor((i + 1) * bucketSize))
    let sum = 0
    let count = 0
    for (let j = start; j < end && j < samplesDb.length; j++) {
      sum += meterToAmplitude(samplesDb[j])
      count += 1
    }
    const amplitude = count > 0 ? sum / count : 0
    out.push(Math.round(amplitude * 255))
  }
  return out
}
