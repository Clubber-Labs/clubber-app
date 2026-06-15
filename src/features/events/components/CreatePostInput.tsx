import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Keyboard,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAddPost, useUploadPostImages } from '../hooks/usePosts'
import { EventImagePicker } from './EventImagePicker'
import { useMe } from '@/features/auth/hooks/useMe'
import { colors } from '@/shared/theme'

const MAX_POST_IMAGES = 4

type Props = {
  eventId: string
  disabled?: boolean
  disabledReason?: string
}

export function CreatePostInput({ eventId, disabled, disabledReason }: Props) {
  const [text, setText] = useState('')
  const [imageUris, setImageUris] = useState<string[]>([])
  const { data: me } = useMe()
  const addPost = useAddPost(eventId)
  const uploadImages = useUploadPostImages(eventId)

  function handleSend() {
    const content = text.trim()
    if (!content) return
    Keyboard.dismiss()
    // Texto-first: cria o post e, com sucesso, sobe as imagens contra o id
    // criado (mesmo padrão do create de evento). A navegação/limpeza não
    // espera o upload terminar.
    const uris = imageUris
    addPost.mutate(content, {
      onSuccess: post => {
        if (uris.length > 0) {
          uploadImages.mutate({ postId: post.id, uris })
        }
        setText('')
        setImageUris([])
      },
    })
  }

  if (disabled) {
    return (
      <View className="bg-brand-surface border border-info rounded-xl px-4 py-3">
        <Text className="text-sm text-brand-text-strong">
          {disabledReason ?? 'Você não pode postar agora.'}
        </Text>
      </View>
    )
  }

  return (
    <View className="bg-surface border border-line rounded-xl p-3 gap-2">
      <View className="flex-row gap-2 items-start">
        <View className="w-9 h-9 rounded-full bg-brand-surface-strong items-center justify-center">
          <Text className="text-brand-text-strong font-semibold">
            {me?.name?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <TextInput
          className="flex-1 text-base text-content min-h-[40px] max-h-32 pt-2"
          placeholder="Compartilhe algo sobre o evento..."
          placeholderTextColor={colors.contentSubtle}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
        />
      </View>

      <View className="pl-11">
        <EventImagePicker
          uris={imageUris}
          onChange={setImageUris}
          maxCount={MAX_POST_IMAGES}
          label="Fotos da publicação"
        />
      </View>

      <View className="flex-row items-center justify-between pl-11">
        <Text className="text-xs text-content-subtle">{text.length}/1000</Text>
        <Pressable
          onPress={handleSend}
          disabled={!text.trim() || addPost.isPending}
          className={`flex-row items-center gap-1 px-4 py-2 rounded-lg ${text.trim() && !addPost.isPending ? 'bg-brand' : 'bg-surface-higher'}`}
        >
          {addPost.isPending ? (
            <ActivityIndicator size="small" color={colors.content} />
          ) : (
            <Ionicons name="send" size={14} color={colors.content} />
          )}
          <Text className="text-sm font-semibold text-content">Publicar</Text>
        </Pressable>
      </View>
    </View>
  )
}
