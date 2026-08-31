import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { eventsService } from '../services/eventsService'
import { eventKeys, invalidateEventViews } from './cacheKeys'
import { sortByOrder } from '../lib/gallery'
import { getApiError } from '@/shared/lib/apiError'
import { useBanner } from '@/shared/lib/banner'
import type { EventDetail, EventImage } from '@/shared/types'

// Teto que o backend pratica hoje. Vale só até o primeiro 409: quem manda no
// número é o `params.max` de EVENT_IMAGE_LIMIT, e é dele que a tela passa a
// viver se o backend mudar o limite.
const FALLBACK_MAX_IMAGES = 5

function patchGallery(
  queryClient: QueryClient,
  eventId: string,
  update: (images: EventImage[]) => EventImage[],
) {
  queryClient.setQueryData<EventDetail>(eventKeys.detail(eventId), old =>
    old ? { ...old, images: update(old.images) } : old,
  )
}

/**
 * Sobe fotos, uma requisição por foto, e devolve o teto conhecido da galeria.
 *
 * Sequencial de propósito: o backend conta as imagens ANTES de gravar, então
 * dois POSTs simultâneos passariam juntos pelo mesmo teto. Cada foto que chega
 * já entra na galeria — se a seguinte falhar, o que subiu fica.
 */
export function useAddEventImages(eventId: string) {
  const queryClient = useQueryClient()
  const showBanner = useBanner()
  const [max, setMax] = useState(FALLBACK_MAX_IMAGES)

  const { mutate, isPending } = useMutation({
    mutationFn: async (uris: string[]) => {
      for (const uri of uris) {
        const image = await eventsService.uploadEventImage(eventId, uri)
        patchGallery(queryClient, eventId, images => [...images, image])
      }
    },
    // Aqui o revert não fala: a foto nunca chegou a aparecer. Sem uma linha
    // dizendo o porquê (teto batido, arquivo inválido), o toque no + parece não
    // ter feito nada.
    onError: error => {
      const { code, params, message } = getApiError(error)
      if (code === 'EVENT_IMAGE_LIMIT') {
        const declared = Number(params?.max)
        if (Number.isFinite(declared) && declared > 0) setMax(declared)
      }
      showBanner(message)
    },
    onSettled: () => invalidateEventViews(queryClient, eventId),
  })

  return { upload: mutate, isUploading: isPending, max }
}

// Optimistic remove — a foto some na hora e volta se o backend recusar. Tirar a
// primeira promove a seguinte a capa sozinho, dos dois lados: nada de PATCH
// depois.
export function useDeleteEventImage(eventId: string) {
  const queryClient = useQueryClient()
  const key = eventKeys.detail(eventId)

  return useMutation({
    mutationFn: (imageId: string) =>
      eventsService.deleteEventImage(eventId, imageId),
    onMutate: async imageId => {
      await queryClient.cancelQueries({ queryKey: key })
      const prev = queryClient.getQueryData<EventDetail>(key)
      patchGallery(queryClient, eventId, images =>
        images.filter(image => image.id !== imageId),
      )
      return { prev }
    },
    onError: (_err, _imageId, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev)
    },
    onSettled: () => invalidateEventViews(queryClient, eventId),
  })
}

// Reordenar É trocar a capa: images[0] é o banner do evento em toda tela que o
// mostra. O PATCH leva a galeria inteira na nova ordem — mandar só o que mudou
// volta 400.
export function useReorderEventImages(eventId: string) {
  const queryClient = useQueryClient()
  const key = eventKeys.detail(eventId)

  return useMutation({
    mutationFn: (order: string[]) =>
      eventsService.reorderEventImages(eventId, order),
    onMutate: async order => {
      await queryClient.cancelQueries({ queryKey: key })
      const prev = queryClient.getQueryData<EventDetail>(key)
      patchGallery(queryClient, eventId, images => sortByOrder(images, order))
      return { prev }
    },
    onSuccess: images => patchGallery(queryClient, eventId, () => images),
    onError: (_err, _order, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev)
    },
    onSettled: () => invalidateEventViews(queryClient, eventId),
  })
}
