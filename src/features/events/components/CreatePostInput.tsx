import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Keyboard,
} from 'react-native'
import { CameraIcon, PaperPlaneTiltIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { useAddPost, useUploadPostImages } from '../hooks/usePosts'
import { EventImagePicker } from './EventImagePicker'
import { useMe } from '@/features/auth/hooks/useMe'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { colors } from '@/shared/theme'

const MAX_POST_IMAGES = 4
const AVATAR = 36

type Props = {
  eventId: string
  disabled?: boolean
  disabledReason?: string
  placeholder?: string
}

/**
 * Convite a postar, compacto: uma linha com avatar, campo e câmera. Só cresce
 * (contador, seletor de fotos, botão de enviar) quando há o que enviar — em
 * repouso ele não pode competir com os posts logo abaixo.
 */
export function CreatePostInput({
  eventId,
  disabled,
  disabledReason,
  placeholder,
}: Props) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [imageUris, setImageUris] = useState<string[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const { data: me } = useMe()
  const addPost = useAddPost(eventId)
  const uploadImages = useUploadPostImages(eventId)

  const filled = !!text.trim()
  const expanded = filled || pickerOpen || imageUris.length > 0

  function handleSend() {
    const content = text.trim()
    if (!content) return
    Keyboard.dismiss()
    // Texto-first: cria o post e, com sucesso, sobe as imagens contra o id
    // criado (mesmo padrão do create de evento). A limpeza não espera o upload.
    const uris = imageUris
    addPost.mutate(content, {
      onSuccess: post => {
        if (uris.length > 0) {
          uploadImages.mutate({ postId: post.id, uris })
        }
        setText('')
        setImageUris([])
        setPickerOpen(false)
      },
    })
  }

  if (disabled) {
    return (
      <View className="rounded-xl bg-surface-elevated px-4 py-3">
        <Text className="text-sm text-content-secondary">
          {disabledReason ?? t('events.posts.cannotPost')}
        </Text>
      </View>
    )
  }

  return (
    <View className="gap-2 rounded-2xl border border-line bg-surface p-2.5">
      <View className="flex-row items-center gap-2.5">
        <UserAvatar
          name={me?.name ?? ''}
          avatarUrl={me?.avatarUrl}
          size={AVATAR}
        />
        <TextInput
          className="max-h-28 flex-1 text-[15px] text-content"
          placeholder={placeholder ?? t('events.posts.placeholder')}
          placeholderTextColor={colors.contentSubtle}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
        />
        {!expanded && (
          <Pressable
            onPress={() => setPickerOpen(true)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={t('events.posts.imagesLabel')}
            className="h-9 w-9 items-center justify-center rounded-full bg-surface-elevated"
          >
            <CameraIcon size={18} color={colors.contentSecondary} />
          </Pressable>
        )}
      </View>

      {expanded && (
        <View className="gap-2 pl-[46px]">
          <EventImagePicker
            uris={imageUris}
            onChange={setImageUris}
            maxCount={MAX_POST_IMAGES}
            label={t('events.posts.imagesLabel')}
          />
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-content-subtle">
              {`${text.length}/1000`}
            </Text>
            <Pressable
              onPress={handleSend}
              disabled={!filled || addPost.isPending}
              accessibilityRole="button"
              className={`flex-row items-center gap-1.5 rounded-full px-4 py-2 ${
                filled && !addPost.isPending ? 'bg-content' : 'bg-surface-high'
              }`}
            >
              {addPost.isPending ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <PaperPlaneTiltIcon
                  size={14}
                  weight="fill"
                  color={filled ? colors.background : colors.contentMuted}
                />
              )}
              <Text
                className={`text-sm font-bold ${filled && !addPost.isPending ? 'text-background' : 'text-content-muted'}`}
              >
                {t('events.posts.publish')}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  )
}
