import { useState } from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { EventForm } from '@/features/events/components/EventForm'
import { EventImagePicker } from '@/features/events/components/EventImagePicker'
import { useCreateEvent } from '@/features/events/hooks/useCreateEvent'
import { useUploadEventImages } from '@/features/events/hooks/useUploadEventImages'
import type { CreateEventInput } from '@/features/events/schemas/createEventSchema'

export default function CreateEventScreen() {
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
        submitLabel="Criar evento"
        submittingLabel="Criando..."
        errorMessage="Não foi possível criar o evento. Tente novamente."
        imagesSection={
          <EventImagePicker uris={imageUris} onChange={setImageUris} />
        }
      />
    </View>
  )
}
