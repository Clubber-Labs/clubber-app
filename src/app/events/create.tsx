import { useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { EventForm } from '@/features/events/components/EventForm'
import { ImageGalleryPicker } from '@/shared/components/ImageGalleryPicker'
import { useCreateEvent } from '@/features/events/hooks/useCreateEvent'
import { useUploadEventImages } from '@/features/events/hooks/useUploadEventImages'
import type { CreateEventInput } from '@/features/events/schemas/createEventSchema'

export default function CreateEventScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const create = useCreateEvent()
  const uploadImages = useUploadEventImages()
  const [imageUris, setImageUris] = useState<string[]>([])

  function handleSubmit(data: CreateEventInput) {
    create.mutate(data, {
      onSuccess: created => {
        if (imageUris.length > 0) {
          // Upload em paralelo no background; navega imediato pra UX rápida.
          // Cache da detail invalida quando termina (no onSettled do hook).
          uploadImages.mutate({ eventId: created.id, uris: imageUris })
        }
        router.replace(`/events/${created.id}`)
      },
    })
  }

  return (
    <View className="flex-1 bg-background">
      <EventForm
        onSubmit={handleSubmit}
        submitting={create.isPending}
        submitError={!!create.error}
        submitLabel={t('events.create.submit')}
        submittingLabel={t('events.create.submitting')}
        errorMessage={t('events.create.error')}
        imagesSection={
          <ImageGalleryPicker
            uris={imageUris}
            onChange={setImageUris}
            label={t('events.imagePicker.label')}
          />
        }
      />
    </View>
  )
}
