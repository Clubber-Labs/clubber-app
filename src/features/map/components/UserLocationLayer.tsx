import { useEffect, useMemo, useRef, useState } from 'react'
import { View, Image } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import { LOCATION_BLUE } from '../constants'

type Props = {
  // [longitude, latitude] (convenção Mapbox).
  coordinate: [number, number]
  avatarUrl?: string | null
}

const DOT_RADIUS = 7
const PULSE_MAX = 48
const PULSE_MS = 2000
const AVATAR_SIZE = 40
const RING = 3
const AVATAR_IMAGE = 'user-location-avatar'

export function UserLocationLayer({ coordinate, avatarUrl }: Props) {
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

  const imageRef = useRef<{ refresh: () => void }>(null)
  const innerSize = AVATAR_SIZE - RING * 2
  const [avatarReady, setAvatarReady] = useState(false)
  useEffect(() => {
    if (!avatarUrl) {
      setAvatarReady(false)
      return
    }
    let active = true
    Image.prefetch(avatarUrl)
      .then(ok => active && setAvatarReady(ok))
      .catch(() => active && setAvatarReady(false))
    return () => {
      active = false
    }
  }, [avatarUrl])

  const showAvatar = !!avatarUrl && avatarReady
  const pulseBase = showAvatar ? AVATAR_SIZE / 2 : DOT_RADIUS

  return (
    <>
      {showAvatar && (
        <Mapbox.Images>
          <Mapbox.Image ref={imageRef} name={AVATAR_IMAGE}>
            <View
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
                borderWidth: RING,
                borderColor: '#ffffff',
                backgroundColor: '#ffffff',
                overflow: 'hidden',
              }}
            >
              <Image
                source={{ uri: avatarUrl }}
                style={{
                  width: innerSize,
                  height: innerSize,
                  borderRadius: innerSize / 2,
                }}
                onLoad={() => imageRef.current?.refresh()}
              />
            </View>
          </Mapbox.Image>
        </Mapbox.Images>
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
              circleStrokeColor: '#ffffff',
              circleStrokeWidth: 3,
              circleEmissiveStrength: 1,
            }}
          />
        )}
      </Mapbox.ShapeSource>
    </>
  )
}
