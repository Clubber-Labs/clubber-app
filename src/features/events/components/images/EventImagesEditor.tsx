import { useMemo, useRef, useState } from 'react'
import { Text, View } from 'react-native'
import type { LayoutChangeEvent } from 'react-native'
import { useTranslation } from 'react-i18next'
import { usePickImages } from '@/shared/hooks/usePickImages'
import { useOptionalFormFocus } from '@/shared/lib/formFocus'
import { useConfirm } from '@/shared/lib/confirm'
import { useBanner } from '@/shared/lib/banner'
import { getApiError } from '@/shared/lib/apiError'
import { hapticLight, hapticSelection } from '@/shared/lib/haptics'
import {
  useAddEventImages,
  useDeleteEventImage,
  useReorderEventImages,
} from '../../hooks/useEventImages'
import { moveItem, sameSequence, sortByOrder } from '../../lib/gallery'
import { gridHeight, slotPosition, tileSize } from '../../lib/imageGrid'
import { EventImageTile } from './EventImageTile'
import { AddEventImageTile } from './AddEventImageTile'
import type { EventImage } from '@/shared/types'

const COLUMNS = 3
const GAP = 8

type Props = {
  eventId: string
  images: EventImage[]
}

/**
 * Galeria do evento já publicado. Não passa pelo Salvar do formulário: cada
 * mudança é uma rota própria e vale na hora — daí a linha avisando isso.
 *
 * A capa é `images[0]`, não um campo: promover foto e reordenar são o mesmo
 * PATCH, e remover a primeira promove a seguinte sem pedir nada.
 */
export function EventImagesEditor({ eventId, images }: Props) {
  const { t } = useTranslation()
  const confirm = useConfirm()
  const showBanner = useBanner()
  // A grade mora dentro da ScrollView do formulário: sem travá-la, o arraste da
  // foto e a rolagem da tela disputam o mesmo dedo.
  const form = useOptionalFormFocus()

  const { upload, isUploading, max } = useAddEventImages(eventId)
  const remove = useDeleteEventImage(eventId)
  const reorder = useReorderEventImages(eventId)

  const [width, setWidth] = useState(0)
  const [order, setOrder] = useState<string[] | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  // Espelha `order` pra ler a ordem mais recente dentro dos callbacks do gesto,
  // que rodam com o closure do último render (mesmo motivo do confirm.tsx).
  const orderRef = useRef<string[] | null>(null)

  const displayed = useMemo(() => sortByOrder(images, order), [images, order])

  // Uma escrita por vez: o PATCH exige a galeria EXATA, e uma foto entrando ou
  // saindo no meio do arraste faria a ordem enviada não bater mais (400).
  const busy = isUploading || remove.isPending || reorder.isPending
  const canAdd = images.length < max
  const pick = usePickImages(upload, {
    maxCount: Math.max(0, max - images.length),
  })

  const geometry = {
    size: tileSize(width, GAP, COLUMNS),
    gap: GAP,
    columns: COLUMNS,
  }
  const ready = geometry.size > 0
  const showAddTile = canAdd || isUploading
  const slots = displayed.length + (showAddTile ? 1 : 0)

  function setDraggedOrder(next: string[] | null) {
    orderRef.current = next
    setOrder(next)
  }

  function applyOrder(next: string[]) {
    setDraggedOrder(next)
    reorder.mutate(next, {
      // A foto voltando ao lugar diz que não pegou, mas não diz que a galeria
      // mudou por baixo (IMAGE_ORDER_MISMATCH) — sem a linha, vira mistério.
      onError: error => showBanner(getApiError(error).message),
      onSettled: () => setDraggedOrder(null),
    })
  }

  function handleLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width)
  }

  function handleDragStart(id: string) {
    hapticLight()
    form?.setScrollLocked(true)
    setDraggingId(id)
    setDraggedOrder(displayed.map(image => image.id))
  }

  function handleDragOver(id: string, slot: number) {
    const current = orderRef.current ?? displayed.map(image => image.id)
    const from = current.indexOf(id)
    if (from === -1 || from === slot) return
    hapticSelection()
    setDraggedOrder(moveItem(current, from, slot))
  }

  function handleDragEnd() {
    form?.setScrollLocked(false)
    setDraggingId(null)
    const next = orderRef.current
    const saved = images.map(image => image.id)
    if (!next || sameSequence(next, saved)) {
      setDraggedOrder(null)
      return
    }
    applyOrder(next)
  }

  function handleSetCover(id: string) {
    const ids = displayed.map(image => image.id)
    const from = ids.indexOf(id)
    if (from <= 0) return
    applyOrder(moveItem(ids, from, 0))
  }

  async function handleRemove(id: string) {
    const ok = await confirm({
      title: t('events.imagePicker.removePhoto'),
      message: t('events.imagesEditor.removeMessage'),
      confirmLabel: t('events.imagesEditor.removeConfirm'),
      destructive: true,
    })
    if (ok) remove.mutate(id)
  }

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-content-tertiary">
        {t('events.imagePicker.label')}{' '}
        <Text className="text-content-subtle text-xs">
          ({images.length}/{max})
        </Text>
      </Text>

      <View
        onLayout={handleLayout}
        style={{ height: ready ? gridHeight(slots, geometry) : 0 }}
      >
        {ready &&
          displayed.map((image, index) => {
            const { x, y } = slotPosition(index, geometry)
            return (
              <EventImageTile
                key={image.id}
                url={image.url}
                x={x}
                y={y}
                index={index}
                count={displayed.length}
                geometry={geometry}
                isCover={index === 0}
                active={draggingId === image.id}
                disabled={busy}
                onSetCover={() => handleSetCover(image.id)}
                onRemove={() => handleRemove(image.id)}
                onDragStart={() => handleDragStart(image.id)}
                onDragOver={slot => handleDragOver(image.id, slot)}
                onDragEnd={handleDragEnd}
              />
            )
          })}
        {ready && showAddTile && (
          <AddEventImageTile
            {...slotPosition(displayed.length, geometry)}
            size={geometry.size}
            uploading={isUploading}
            disabled={busy || !canAdd}
            onPress={pick}
          />
        )}
      </View>

      <View className="gap-0.5">
        <Text className="text-xs text-content-muted">
          {t('events.imagesEditor.savedOnTheSpot')}
        </Text>
        {displayed.length > 1 && (
          <Text className="text-xs text-content-subtle">
            {t('events.imagesEditor.hint')}
          </Text>
        )}
      </View>
    </View>
  )
}
