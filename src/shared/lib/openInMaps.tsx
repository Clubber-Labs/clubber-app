// Seletor "abrir no mapa" — componente próprio (sheet dark), mesmo padrão
// imperativo do useConfirm (ver confirm.tsx). Opções: Google Maps, Apple Maps
// (só iOS) e Waze.
import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { Linking, Platform } from 'react-native'
import {
  MapsChooserSheet,
  type MapsOption,
} from '../components/MapsChooserSheet'
import {
  appleMapsUrl,
  googleMapsUrl,
  hasMapTarget,
  wazeUrl,
  type MapTarget,
} from '../utils/mapLinks'

type OpenInMapsFn = (target: MapTarget) => void

const OpenInMapsContext = createContext<OpenInMapsFn | null>(null)

export function OpenInMapsProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<MapTarget | null>(null)

  const openInMaps = useCallback<OpenInMapsFn>(next => {
    if (hasMapTarget(next)) setTarget(next)
  }, [])

  function close() {
    setTarget(null)
  }

  function launch(url: string) {
    close()
    // URLs http(s) abrem o app de mapas ou o navegador como fallback; falha é
    // silenciosa — o sheet já fechou e não há feedback de erro pontual.
    Linking.openURL(url).catch(() => {})
  }

  const options: MapsOption[] = []
  if (target) {
    options.push({
      key: 'google',
      label: 'Google Maps',
      icon: 'logo-google',
      onPress: () => launch(googleMapsUrl(target)),
    })
    if (Platform.OS === 'ios') {
      options.push({
        key: 'apple',
        label: 'Apple Maps',
        icon: 'map-outline',
        onPress: () => launch(appleMapsUrl(target)),
      })
    }
    options.push({
      key: 'waze',
      label: 'Waze',
      icon: 'navigate-outline',
      onPress: () => launch(wazeUrl(target)),
    })
  }

  return (
    <OpenInMapsContext.Provider value={openInMaps}>
      {children}
      <MapsChooserSheet
        visible={!!target}
        title={target?.address ?? undefined}
        options={options}
        onClose={close}
      />
    </OpenInMapsContext.Provider>
  )
}

export function useOpenInMaps(): OpenInMapsFn {
  const fn = useContext(OpenInMapsContext)
  if (!fn) {
    throw new Error('useOpenInMaps must be used within <OpenInMapsProvider>')
  }
  return fn
}
