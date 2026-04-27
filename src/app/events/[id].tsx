import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import type { EventDetail } from '@/shared/types'
import { useEvent } from '@/features/events/hooks/useEvents'
import { EventHeader } from '@/features/events/components/EventHeader'
import { EventMap } from '@/features/events/components/EventMap'
import { EventAttendanceButton } from '@/features/events/components/EventAttendanceButton'
import { EventPostsFeed } from '@/features/events/components/EventPostsFeed'

type HeaderProps = {
  event: EventDetail
}

function DetailHeader({ event }: HeaderProps) {
  return (
    <View>
      <EventHeader event={event} />
      <View className="pt-4 pb-5 gap-5">
        <EventAttendanceButton
          eventId={event.id}
          current={event.userAttendance}
        />
        <EventMap latitude={event.latitude} longitude={event.longitude} />
      </View>
      <View className="px-4 pb-2 border-t border-zinc-800" />
    </View>
  )
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data: event, isLoading, isError } = useEvent(id)

  if (isLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    )
  }

  if (isError || !event) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6 gap-3">
        <Text className="text-zinc-200 text-center">
          Não foi possível carregar o evento.
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-violet-400 font-semibold">Voltar</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-black"
    >
      <EventPostsFeed
        eventId={event.id}
        myAttendance={event.userAttendance}
        ListHeaderComponent={<DetailHeader event={event} />}
      />
    </KeyboardAvoidingView>
  )
}
