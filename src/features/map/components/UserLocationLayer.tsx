import { useEffect, useMemo, useState } from 'react'
import { PixelRatio } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import { LOCATION_BLUE, USER_AVATAR_SIZE } from '../constants'
import { colors } from '@/shared/theme'

type Props = {
  // [longitude, latitude] (convenção Mapbox).
  coordinate: [number, number]
  // PNG local já circular, pré-capturado pelo UserAvatarIconCapture.
  avatarIconUri?: string | null
}

const DOT_RADIUS = 7
const PULSE_MAX = 48
const PULSE_MS = 2000
const AVATAR_IMAGE = 'user-location-avatar'

export function UserLocationLayer({ coordinate, avatarIconUri }: Props) {
  const [lng, lat] = coordinate
  const shape = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lng, lat] },
          properties: {},
        },
      ],
    }),
    [lng, lat],
  )

  // Pulse via loop simples (style layer não aceita Animated/Reanimated): t vai
  // de 0→1 a cada PULSE_MS; o anel cresce e some, igual ao sonar anterior.
  const [t, setT] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      setT(((Date.now() - start) % PULSE_MS) / PULSE_MS)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const showAvatar = !!avatarIconUri
  const pulseBase = showAvatar ? USER_AVATAR_SIZE / 2 : DOT_RADIUS

  return (
    <>
      {/* Registro NATIVO do arquivo (não snapshot de View) — determinístico no
          cold start. O scale devolve o PNG capturado em pixels físicos pro
          tamanho em dp. */}
      {avatarIconUri && (
        <Mapbox.Images
          images={{
            [AVATAR_IMAGE]: { url: avatarIconUri, scale: PixelRatio.get() },
          }}
        />
      )}

      <Mapbox.ShapeSource id="user-location-source" shape={shape}>
        <Mapbox.CircleLayer
          id="user-location-pulse"
          style={{
            // emissiveStrength 1 → a layer emite a própria cor e ignora a luz
            // do tema (lightPreset 'night' do Mapbox Standard), que escurecia
            // tudo no style stack. O fade é só a translucidez do halo.
            circleRadius: pulseBase + t * (PULSE_MAX - pulseBase),
            circleColor: LOCATION_BLUE,
            // Fade-in + fade-out (seno): opacidade ~0 nas duas pontas do ciclo,
            // então o reinício do loop fica invisível (sem "pop" no centro).
            circleOpacity: 0.45 * Math.sin(t * Math.PI),
            circleEmissiveStrength: 1,
          }}
        />
        {showAvatar ? (
          <Mapbox.SymbolLayer
            id="user-location-avatar-layer"
            aboveLayerID="user-location-pulse"
            style={{
              iconImage: AVATAR_IMAGE,
              iconSize: 1,
              iconAllowOverlap: true,
              iconIgnorePlacement: true,
              iconEmissiveStrength: 1,
            }}
          />
        ) : (
          // Sem foto ainda: ponto azul padrão (degrada pro "blue dot").
          <Mapbox.CircleLayer
            id="user-location-dot"
            aboveLayerID="user-location-pulse"
            style={{
              circleRadius: DOT_RADIUS,
              circleColor: LOCATION_BLUE,
              circleStrokeColor: colors.content,
              circleStrokeWidth: 3,
              circleEmissiveStrength: 1,
            }}
          />
        )}
      </Mapbox.ShapeSource>
    </>
  )
}
