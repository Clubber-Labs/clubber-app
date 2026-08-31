import { View, Text, ActivityIndicator, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { EventForm } from '@/features/events/components/EventForm'
import { EventImagesEditor } from '@/features/events/components/images/EventImagesEditor'
import { useEvent } from '@/features/events/hooks/useEvents'
import { useUpdateEvent } from '@/features/events/hooks/useUpdateEvent'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { CreateEventInput } from '@/features/events/schemas/createEventSchema'
import type { EventDetail } from '@/shared/types'
import { colors } from '@/shared/theme'

function toDefaults(event: EventDetail): Partial<CreateEventInput> {
  return {
    title: event.title,
    description: event.description ?? '',
    date: new Date(event.date),
    endDate: event.endDate ? new Date(event.endDate) : undefined,
    address: event.address ?? '',
    latitude: event.latitude,
    longitude: event.longitude,
    placeId: event.placeId ?? null,
    venueName: event.venueName ?? null,
    categories: event.categories,
    subcategories: event.subcategories ?? [],
    isPublic: event.isPublic,
  }
}

export default function EditEventScreen() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const userId = useAuthStore(state => state.userId)
  const { data: event, isLoading, isError } = useEvent(id)
  const { mutate, isPending, error } = useUpdateEvent(id)

  function handleSubmit(data: CreateEventInput) {
    mutate(data, {
      onSuccess: () => router.replace(`/events/${id}`),
    })
  }

  // Gate em render: não-autor é redirecionado sem montar o form (evita flash
  // de UI inconsistente). Backend já bloqueia o PUT.
  if (event && userId && event.authorId !== userId) {
    return <Redirect href={`/events/${id}`} />
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.brandEmphasis} />
      </View>
    )
  }

  if (isError || !event) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6 gap-3">
        <Text className="text-content-secondary text-center">
          {t('events.detail.loadError')}
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-brand-text font-semibold">
            {t('common.back')}
          </Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <EventForm
        defaultValues={toDefaults(event)}
        onSubmit={handleSubmit}
        submitting={isPending}
        submitError={!!error}
        submitLabel={t('events.edit.submit')}
        submittingLabel={t('events.edit.submitting')}
        errorMessage={t('events.edit.error')}
        imagesSection={
          <EventImagesEditor eventId={event.id} images={event.images} />
        }
      />
    </View>
  )
}
