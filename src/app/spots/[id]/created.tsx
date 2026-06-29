import { View, Text, ActivityIndicator, Pressable, Share } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Linking from 'expo-linking'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { Button } from '@/shared/components/Button'
import { useSpot } from '@/features/spots/hooks/useSpot'
import { formatSpotWindow } from '@/features/spots/utils/spotWindow'
import { colors } from '@/shared/theme'

// Tela de sucesso após publicar um spot: confirma que está "no ar" e leva às
// próximas ações — convidar a galera (Share com o deep link do spot, o mesmo
// modelo de convite do app) e abrir o chat do grupo criado na publicação.
export default function SpotCreatedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data: spot, isLoading, error } = useSpot(id)

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.brandEmphasis} />
      </View>
    )
  }

  // Sem o spot (falha de rede logo após criar) cai no detalhe, que reconsulta.
  if (error || !spot) return <Redirect href={`/spots/${id}`} />

  const visibilityLabel = spot.visibility === 'PUBLIC' ? 'Público' : 'Amigos'

  // Arrow (não function declaration) pra preservar o narrowing de `spot` —
  // criada após o guard, o TS sabe que aqui ele não é undefined.
  const handleInvite = async () => {
    try {
      const url = Linking.createURL(`/spots/${spot.id}`)
      await Share.share({
        title: spot.title,
        message: `Bora nesse rolê? "${spot.title}" — entra no Clubber: ${url}`,
      })
    } catch {
      // Compartilhamento cancelado/indisponível — silencioso (padrão do app).
    }
  }

  return (
    <View className="flex-1 bg-background items-center justify-center px-6 gap-5">
      <View className="w-20 h-20 rounded-full bg-brand items-center justify-center">
        <Ionicons name="checkmark" size={40} color={colors.content} />
      </View>

      <View className="items-center gap-2">
        <Text className="text-content text-2xl font-bold text-center">
          Rolê no ar!
        </Text>
        <Text className="text-content-muted text-sm text-center">
          Seu spot fica visível no mapa por 24h. Agora chama a galera.
        </Text>
      </View>

      <View className="w-full flex-row items-center gap-3 bg-surface border border-line rounded-xl p-3">
        <View className="w-12 h-12 rounded-lg bg-brand-surface border border-brand-surface-strong items-center justify-center">
          <Ionicons name="location" size={20} color={colors.brandText} />
        </View>
        <View className="flex-1">
          <Text
            className="text-content text-sm font-semibold"
            numberOfLines={1}
          >
            {spot.title}
          </Text>
          <Text className="text-content-subtle text-xs">
            {formatSpotWindow(spot.startsAt, spot.endsAt)} · {visibilityLabel}
          </Text>
        </View>
        <View className="flex-row items-center gap-1 rounded-md bg-success/20 border border-success/30 px-2 py-1">
          <View className="w-1.5 h-1.5 rounded-full bg-success-text" />
          <Text className="text-success-text text-[11px] font-bold">no ar</Text>
        </View>
      </View>

      <View className="w-full gap-3">
        <Button label="Convidar a galera" onPress={handleInvite} />
        <Button
          label="Abrir o chat do rolê"
          variant="neutral"
          onPress={() =>
            router.replace(`/conversations/${spot.conversationId}`)
          }
        />
        <Pressable
          onPress={() => router.replace('/(tabs)/map')}
          accessibilityRole="button"
          className="items-center py-2"
        >
          <Text className="text-content-muted text-sm font-semibold">
            Ver no mapa
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
