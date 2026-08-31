import Mapbox from '@rnmapbox/maps'
import { MAP_STYLE_URL } from '@/shared/theme'

export const SPOT_SNAPSHOT_ZOOM = 14

type SnapshotRequest = {
  key: string
  latitude: number
  longitude: number
  width: number
  height: number
}

/**
 * Índice em memória dos PNGs que o snapshotter grava em disco. Só o índice é
 * volátil: o arquivo vive no diretório de cache do app, que o SO pode limpar a
 * qualquer momento, e sem acesso a filesystem não dá pra validar um caminho
 * guardado entre execuções. Quem exibe trata a falha de carregar regerando.
 */
const files = new Map<string, string>()
const pending = new Map<string, Promise<string | null>>()

// Cada takeSnap sobe uma instância nativa do snapshotter e carrega o estilo
// inteiro. Mais de dois em paralelo estoura memória quando o feed rola rápido.
const MAX_CONCURRENT = 2
let running = 0
const waiting: (() => void)[] = []

function acquire(): Promise<void> {
  if (running < MAX_CONCURRENT) {
    running += 1
    return Promise.resolve()
  }
  return new Promise(resolve => {
    waiting.push(() => {
      running += 1
      resolve()
    })
  })
}

function release() {
  running -= 1
  waiting.shift()?.()
}

// O snapshotter não conhece a config de lightPreset do StyleImport (aquilo é do
// MapView): o tema do PNG é o que o próprio estilo traz salvo, então a URL do
// estilo É a terceira parte da chave.
//
// A MEDIDA fica de fora de propósito: o mesmo lugar em caixas de larguras
// diferentes reusa o PNG esticado pelo cover, e gerar um por tamanho custaria
// outra instância nativa do snapshotter pra uma diferença que ninguém vê.
export function spotSnapshotKey(placeId: string): string {
  return `${placeId}-${SPOT_SNAPSHOT_ZOOM}-${MAP_STYLE_URL}`
}

export function cachedSpotSnapshot(key: string): string | null {
  return files.get(key) ?? null
}

export function dropSpotSnapshot(key: string) {
  files.delete(key)
}

/**
 * PNG estático do mapa centrado no rolê. Uma geração por lugar: chamadas
 * simultâneas pra mesma chave compartilham a promessa em voo. Devolve null
 * quando o módulo nativo não responde (Expo Go, estilo indisponível) — o card
 * fica no padrão neutro em vez de quebrar.
 */
export function takeSpotSnapshot(
  request: SnapshotRequest,
): Promise<string | null> {
  const done = files.get(request.key)
  if (done) return Promise.resolve(done)

  const inFlight = pending.get(request.key)
  if (inFlight) return inFlight

  const task = run(request).finally(() => pending.delete(request.key))
  pending.set(request.key, task)
  return task
}

async function run({
  key,
  latitude,
  longitude,
  width,
  height,
}: SnapshotRequest): Promise<string | null> {
  await acquire()
  try {
    // `width`/`height` vão em PONTOS e `withLogo` desliga a marca d'água
    // inteira (logo + crédito) — os dois só se comportam assim por causa de
    // patches/@rnmapbox__maps.patch. Sem o patch o PNG sai borrado no iOS
    // (pixelRatio fixo em 1.0) e com o crédito queimado nas duas plataformas.
    const uri = await Mapbox.snapshotManager.takeSnap({
      centerCoordinate: [longitude, latitude],
      zoomLevel: SPOT_SNAPSHOT_ZOOM,
      width,
      height,
      styleURL: MAP_STYLE_URL,
      writeToDisk: true,
      withLogo: false,
    })
    files.set(key, uri)
    return uri
  } catch {
    return null
  } finally {
    release()
  }
}
