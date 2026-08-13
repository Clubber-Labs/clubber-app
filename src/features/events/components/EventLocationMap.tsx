import Mapbox from '@rnmapbox/maps'
import { LocationMap } from '@/shared/components/LocationMap'
import {
  EventPin,
  EVENT_PIN_SIZE,
  EVENT_PIN_TIP_ANCHOR,
} from '@/features/map/components/EventPin'
import {
  eventPinLook,
  type EventPinSource,
} from '@/features/map/utils/eventPinLook'

type Props = {
  event: EventPinSource & { latitude: number; longitude: number }
  height?: number
}

// Local do evento na tela de detalhe: a MESMA gota do mapa principal (emoji da
// categoria, espectro do "agora", inversão do patrocinado, esmaecido quando
// encerrado) — o pin que o usuário tocou no mapa é o que ele reencontra aqui.
export function EventLocationMap({ event, height }: Props) {
  return (
    <LocationMap
      latitude={event.latitude}
      longitude={event.longitude}
      height={height}
    >
      <Mapbox.MarkerView
        id="event-location"
        coordinate={[event.longitude, event.latitude]}
        anchor={EVENT_PIN_TIP_ANCHOR}
        allowOverlap
      >
        <EventPin {...eventPinLook(event)} size={EVENT_PIN_SIZE} />
      </Mapbox.MarkerView>
    </LocationMap>
  )
}
