import { useCallback, useRef, useState } from 'react'
import {
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { isAxiosError } from 'axios'
import * as ImagePicker from 'expo-image-picker'
import * as Clipboard from 'expo-clipboard'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useBanner } from '@/shared/lib/banner'
import { useConfirm } from '@/shared/lib/confirm'
import {
  getApiError,
  isConflictError,
  isForbiddenError,
} from '@/shared/lib/apiError'
import { hapticLight } from '@/shared/lib/haptics'
import { useConversation } from '@/features/chat/hooks/useConversation'
import { useMessagesMutations } from '@/features/chat/hooks/useMessagesMutations'
import { useReadConversation } from '@/features/chat/hooks/useReadConversation'
import { useBlocks } from '@/features/chat/hooks/useBlocks'
import { useReportMessage } from '@/features/chat/hooks/useReportMessage'
import { newClientId } from '@/features/chat/hooks/useSendMessage'
import { useChatRealtimeStore } from '@/features/chat/store/chatRealtimeStore'
import { ConversationHeader } from '@/features/chat/components/ConversationHeader'
import { MessageList } from '@/features/chat/components/MessageList'
import { MessageInputBar } from '@/features/chat/components/MessageInputBar'
import { BlockedBanner } from '@/features/chat/components/BlockedBanner'
import { AttachmentMenu } from '@/features/chat/components/AttachmentMenu'
import { MessageActionsSheet } from '@/features/chat/components/MessageActionsSheet'
import { ReportReasonPicker } from '@/features/chat/components/ReportReasonPicker'
import { ImageViewerModal } from '@/features/chat/components/ImageViewerModal'
import type { UserMini } from '@/shared/types'
import type { ChatMessage, ReportReason } from '@/features/chat/types'

const COOLDOWN_MS = 5000

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const myId = useAuthStore(s => s.userId) ?? ''
  const showBanner = useBanner()
  const confirm = useConfirm()

  const { data: conversation, isLoading } = useConversation(id)
  const setActive = useChatRealtimeStore(s => s.setActiveConversation)
  const read = useReadConversation()
  const report = useReportMessage()
  const { blocks } = useBlocks()

  const isGroup = conversation?.type === 'GROUP'
  const amAdmin =
    conversation?.participants.find(p => p.userId === myId)?.role === 'ADMIN'
  const other = !isGroup
    ? conversation?.participants.find(p => p.userId !== myId)
    : undefined
  const me: UserMini =
    conversation?.participants.find(p => p.userId === myId)?.user ?? {
      id: myId,
      name: '',
      lastname: '',
      username: '',
      avatarUrl: null,
    }

  const { send, sendImage, deleteMessage } = useMessagesMutations(id, me)

  const [blockedByServer, setBlockedByServer] = useState(false)
  const iBlocked = other ? blocks.some(b => b.blocked.id === other.user.id) : false
  const isBlocked = !isGroup && (iBlocked || blockedByServer)

  const [cooldown, setCooldown] = useState(false)
  const [attachOpen, setAttachOpen] = useState(false)
  const [actionsFor, setActionsFor] = useState<ChatMessage | null>(null)
  const [reportFor, setReportFor] = useState<ChatMessage | null>(null)
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)

  // Marca a conversa como ativa (controla unread/read) e a marca lida ao focar.
  const readRef = useRef(read)
  readRef.current = read
  useFocusEffect(
    useCallback(() => {
      setActive(id)
      readRef.current.mutate(id)
      return () => setActive(null)
    }, [id, setActive]),
  )

  function handleSendError(e: unknown) {
    if (isAxiosError(e) && e.response?.status === 429) {
      showBanner('Você está enviando rápido demais, aguarde um instante')
      setCooldown(true)
      setTimeout(() => setCooldown(false), COOLDOWN_MS)
      return
    }
    if (isForbiddenError(e) && !isGroup) setBlockedByServer(true)
  }

  function sendText(text: string) {
    hapticLight()
    send.mutate({ content: text, clientId: newClientId() }, { onError: handleSendError })
  }

  function sendImageUri(uri: string) {
    hapticLight()
    sendImage.mutate({ uri, clientId: newClientId() }, { onError: handleSendError })
  }

  async function pickFromGallery() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
    if (!res.canceled && res.assets[0]) sendImageUri(res.assets[0].uri)
  }

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) {
      showBanner('Permissão de câmera negada.')
      return
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 })
    if (!res.canceled && res.assets[0]) sendImageUri(res.assets[0].uri)
  }

  function onRetry(message: ChatMessage) {
    if (!message.clientId) return
    if (message.attachments.length > 0) {
      sendImage.mutate(
        { uri: message.attachments[0].url, clientId: message.clientId },
        { onError: handleSendError },
      )
    } else if (message.content) {
      send.mutate(
        { content: message.content, clientId: message.clientId },
        { onError: handleSendError },
      )
    }
  }

  function openActions(message: ChatMessage) {
    if (message.deletedAt || message.clientStatus) return
    setActionsFor(message)
  }

  const isMineMessage = actionsFor?.senderId === myId
  const canDelete = !!actionsFor && (isMineMessage || (!!isGroup && !!amAdmin))
  const canReport = !!actionsFor && !isMineMessage

  async function doCopy() {
    if (actionsFor?.content) await Clipboard.setStringAsync(actionsFor.content)
  }

  async function doDelete() {
    if (!actionsFor) return
    const ok = await confirm({
      title: 'Apagar mensagem',
      message: 'Esta mensagem será removida para todos.',
      confirmLabel: 'Apagar',
      destructive: true,
    })
    if (ok) deleteMessage.mutate(actionsFor.id)
  }

  function submitReport(reason: ReportReason, details?: string) {
    if (!reportFor) return
    report.mutate(
      { messageId: reportFor.id, reason, details },
      {
        onSuccess: () => showBanner('Denúncia enviada. Obrigado.'),
        onError: e =>
          showBanner(
            isConflictError(e)
              ? 'Você já denunciou esta mensagem.'
              : getApiError(e).message,
          ),
      },
    )
    setReportFor(null)
  }

  if (isLoading || !conversation) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0}
      className="flex-1 bg-black"
    >
      <ConversationHeader
        conversation={conversation}
        myId={myId}
        onPressDetails={() => router.push(`/conversations/${id}/details`)}
      />

      <View className="flex-1">
        <MessageList
          conversationId={id}
          myId={myId}
          isGroup={!!isGroup}
          otherReadAt={other?.lastReadAt}
          onLongPressMessage={openActions}
          onPressImage={setViewerUrl}
          onRetry={onRetry}
        />
      </View>

      {isBlocked ? (
        <BlockedBanner
          message={
            iBlocked
              ? 'Você bloqueou este usuário.'
              : 'Você não pode mais enviar mensagens nesta conversa.'
          }
        />
      ) : (
        <MessageInputBar
          onSendText={sendText}
          onAttach={() => setAttachOpen(true)}
          disabled={cooldown}
        />
      )}

      <AttachmentMenu
        visible={attachOpen}
        onClose={() => setAttachOpen(false)}
        onGallery={pickFromGallery}
        onCamera={pickFromCamera}
      />
      <MessageActionsSheet
        visible={!!actionsFor}
        message={actionsFor}
        canDelete={canDelete}
        canReport={canReport}
        onClose={() => setActionsFor(null)}
        onCopy={doCopy}
        onReport={() => setReportFor(actionsFor)}
        onDelete={doDelete}
      />
      <ReportReasonPicker
        visible={!!reportFor}
        onClose={() => setReportFor(null)}
        onSubmit={submitReport}
      />
      <ImageViewerModal url={viewerUrl} onClose={() => setViewerUrl(null)} />
    </KeyboardAvoidingView>
  )
}
