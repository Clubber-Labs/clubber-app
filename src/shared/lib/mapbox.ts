import Constants from 'expo-constants'
import Mapbox from '@rnmapbox/maps'

const accessToken = Constants.expoConfig?.extra?.mapboxAccessToken as
  | string
  | undefined

if (accessToken) {
  Mapbox.setAccessToken(accessToken)
} else if (__DEV__) {
  // eslint-disable-next-line no-console
  console.warn(
    '[mapbox] MAPBOX_ACCESS_TOKEN não configurado em .env.local — mapas não vão renderizar.',
  )
}
