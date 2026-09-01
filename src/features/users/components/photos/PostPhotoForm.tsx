import { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { CalendarBlankIcon, CaretRightIcon } from 'phosphor-react-native'
import { useAuthStore } from '@/features/auth/store/authStore'
import { ImageGalleryPicker } from '@/shared/components/ImageGalleryPicker'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { usePickImages } from '@/shared/hooks/usePickImages'
import { getApiError } from '@/shared/lib/apiError'
import { EventLinkSheet, type LinkedEvent } from './EventLinkSheet'
import { useCreateUserPhoto } from '../../hooks/useCreateUserPhoto'
import { colors } from '@/shared/theme'

const MAX_PHOTOS = 10
const MAX_CAPTION = 300

/**
 * Postar foto no mural: o picker abre sozinho ao entrar (o fluxo começa pelas
 * fotos); cancelar sem escolher nada volta. Depois, legenda e vínculo com um
 * evento em que a pessoa esteve, ambos opcionais.
 */
export function PostPhotoForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const myId = useAuthStore(s => s.userId) ?? ''
  const create = useCreateUserPhoto()
  const [uris, setUris] = useState<string[]>([])
  const [caption, setCaption] = useState('')
  const [event, setEvent] = useState<LinkedEvent | null>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pickedSomething = useRef(false)

  const onPicked = useCallback((picked: string[]) => {
    pickedSomething.current = true
    setUris(picked.slice(0, MAX_PHOTOS))
  }, [])
  const pickInitial = usePickImages(onPicked, { maxCount: MAX_PHOTOS })

  useEffect(() => {
    pickInitial().then(() => {
      if (!pickedSomething.current) router.back()
    })
    // Só na entrada: reabrir o picker a cada render seria um loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function publish() {
    setError(null)
    create.mutate(
      {
        uris,
        caption: caption.trim() || undefined,
        eventId: event?.id,
      },
      {
        onSuccess: () => router.back(),
        onError: e => setError(getApiError(e).message),
      },
    )
  }

  if (uris.length === 0 && !pickedSomething.current) {
    return <View className="flex-1 bg-background" />
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-xl font-extrabold text-content">
          {t('profile.photo.title')}
        </Text>

        <ImageGalleryPicker
          uris={uris}
          onChange={setUris}
          maxCount={MAX_PHOTOS}
          label={t('profile.photo.photosLabel')}
        />

        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder={t('profile.photo.captionPlaceholder')}
          placeholderTextColor={colors.contentSubtle}
          multiline
          maxLength={MAX_CAPTION}
          textAlignVertical="top"
          className="min-h-[96px] rounded-xl border border-line bg-surface px-4 py-3 text-[15px] text-content"
        />

        <Pressable
          onPress={() => setLinkOpen(true)}
          accessibilityRole="button"
          className="flex-row items-center gap-3 border-b border-t border-line py-3.5"
        >
          <CalendarBlankIcon size={20} color={colors.contentSecondary} />
          <View className="flex-1">
            <Text className="text-[15px] text-content">
              {t('profile.photo.linkEvent')}
            </Text>
            <Text className="mt-0.5 text-xs text-content-muted" numberOfLines={1}>
              {event?.title ?? t('profile.photo.linkOptional')}
            </Text>
          </View>
          <CaretRightIcon size={18} color={colors.contentSubtle} />
        </Pressable>

        <FormError message={error} />
        <Button
          label={
            create.isPending
              ? t('profile.photo.publishing')
              : t('profile.photo.publish')
          }
          onPress={publish}
          loading={create.isPending}
          disabled={uris.length === 0}
        />
      </ScrollView>

      <EventLinkSheet
        visible={linkOpen}
        userId={myId}
        selected={event}
        onSelect={setEvent}
        onClose={() => setLinkOpen(false)}
      />
    </KeyboardAvoidingView>
  )
}
