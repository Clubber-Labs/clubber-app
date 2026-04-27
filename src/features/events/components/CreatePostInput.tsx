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
import { useAddPost } from '../hooks/usePosts'
import { useMe } from '@/features/auth/hooks/useMe'
import { showError } from '@/shared/lib/toast'

type Props = {
  eventId: string
  disabled?: boolean
  disabledReason?: string
}

export function CreatePostInput({ eventId, disabled, disabledReason }: Props) {
  const [text, setText] = useState('')
  const { data: me } = useMe()
  const addPost = useAddPost(eventId)

  function handleSend() {
    const content = text.trim()
    if (!content) return
    Keyboard.dismiss()
    addPost.mutate(content, {
      onSuccess: () => setText(''),
      onError: showError,
    })
  }

  if (disabled) {
    return (
      <View className="bg-violet-950 border border-blue-100 rounded-xl px-4 py-3">
        <Text className="text-sm text-violet-300">
          {disabledReason ?? 'Você não pode postar agora.'}
        </Text>
      </View>
    )
  }

  return (
    <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 gap-2">
      <View className="flex-row gap-2 items-start">
        <View className="w-9 h-9 rounded-full bg-violet-900 items-center justify-center">
          <Text className="text-violet-300 font-semibold">
            {me?.name?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <TextInput
          className="flex-1 text-base text-white min-h-[40px] max-h-32 pt-2"
          placeholder="Compartilhe algo sobre o evento..."
          placeholderTextColor="#71717a"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
        />
      </View>

      <View className="flex-row items-center justify-between pl-11">
        <Text className="text-xs text-zinc-500">{text.length}/1000</Text>
        <Pressable
          onPress={handleSend}
          disabled={!text.trim() || addPost.isPending}
          className={`flex-row items-center gap-1 px-4 py-2 rounded-full ${text.trim() && !addPost.isPending ? 'bg-violet-600' : 'bg-zinc-600'}`}
        >
          {addPost.isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="send" size={14} color="#ffffff" />
          )}
          <Text className="text-sm font-semibold text-white">Publicar</Text>
        </Pressable>
      </View>
    </View>
  )
}
