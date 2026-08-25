import { View, Text, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useLocalSearchParams } from 'expo-router'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useConversation } from '@/features/chat/hooks/useConversation'
import { useAddParticipant } from '@/features/chat/hooks/useGroupAdmin'
import { PeoplePicker } from '@/features/chat/components/PeoplePicker'
import { UserPickRow } from '@/features/chat/components/UserPickRow'
import { isReachable } from '@/features/chat/utils/reachability'
import { useBanner } from '@/shared/lib/banner'
import { getApiError } from '@/shared/lib/apiError'
import { hapticSelection } from '@/shared/lib/haptics'
import { colors } from '@/shared/theme'

// Tela (não Modal) de propósito: o BannerProvider vive na raiz do _layout e um
// Modal nativo abre em janela própria acima dela — o banner de erro ficaria
// atrás. Como rota, ela também desmonta ao sair (sem busca fantasma na próxima
// abertura) e reusa o PeoplePicker, que já traz sugestões sem query.
export default function AddPeopleScreen() {
  const { t } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const myId = useAuthStore(s => s.userId) ?? ''
  const { data: conversation, isLoading } = useConversation(id)
  const addParticipant = useAddParticipant(id)
  const showBanner = useBanner()

  if (isLoading || !conversation) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={colors.brandEmphasis} />
      </View>
    )
  }

  const memberIds = new Set(conversation.participants.map(p => p.userId))

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 py-2.5 border-b border-line-subtle">
        <Text className="text-content font-semibold text-lg">
          {t('chat.group.addPeople')}
        </Text>
      </View>

      <PeoplePicker
        myId={myId}
        filter={isReachable}
        renderItem={person => {
          // Membro fica marcado e inerte em vez de sumir da lista: o check é o
          // feedback de "entrou", e o revert do otimista é o de "não entrou".
          const isMember = memberIds.has(person.id)
          return (
            <UserPickRow
              user={person}
              selected={isMember}
              disabled={isMember}
              hint={isMember ? t('chat.group.alreadyMember') : undefined}
              onToggle={() => {
                hapticSelection()
                addParticipant.mutate(person, {
                  onError: e => showBanner(getApiError(e).message),
                })
              }}
            />
          )
        }}
      />
    </View>
  )
}
