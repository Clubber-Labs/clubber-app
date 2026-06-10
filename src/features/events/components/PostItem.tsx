import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useNavigateToProfile } from '@/features/users/hooks/useNavigateToProfile'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { useConfirm } from '@/shared/lib/confirm'
import { useDeletePost } from '../hooks/usePosts'
import { formatRelative } from '@/shared/utils/dateFormat'
import type { EventPost } from '@/shared/types'

type Props = {
  eventId: string
  post: EventPost
}

export function PostItem({ eventId, post }: Props) {
  const userId = useAuthStore(s => s.userId)
  const deletePost = useDeletePost(eventId)
  const navigateToProfile = useNavigateToProfile()
  const confirm = useConfirm()

  const isAuthor = userId === post.authorId

  async function handleDelete() {
    const ok = await confirm({
      title: 'Excluir post',
      message: 'Tem certeza que deseja excluir este post?',
      confirmLabel: 'Excluir',
      destructive: true,
    })
    if (ok) deletePost.mutate(post.id)
  }

  return (
    <View className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 gap-3">
      <View className="flex-row items-start justify-between">
        <Pressable
          onPress={() => navigateToProfile(post.author.id)}
          className="flex-row items-center gap-2 flex-1"
          accessibilityLabel={`Ver perfil de ${post.author.username}`}
        >
          <UserAvatar
            name={post.author.name}
            avatarUrl={post.author.avatarUrl}
          />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-white">
              {post.author.name} {post.author.lastname}
            </Text>
            <Text className="text-xs text-zinc-500">
              @{post.author.username} · {formatRelative(post.createdAt)}
            </Text>
          </View>
        </Pressable>

        {isAuthor && (
          <Pressable
            onPress={handleDelete}
            disabled={deletePost.isPending}
            className="w-8 h-8 items-center justify-center"
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </Pressable>
        )}
      </View>

      <Text className="text-base text-zinc-100">{post.content}</Text>

      {post._count && (
        <View className="flex-row gap-4 pt-1">
          <View className="flex-row items-center gap-1">
            <Ionicons name="chatbubble-outline" size={14} color="#71717a" />
            <Text className="text-xs text-zinc-400">
              {post._count.comments}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="heart-outline" size={14} color="#71717a" />
            <Text className="text-xs text-zinc-400">
              {post._count.reactions}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}
