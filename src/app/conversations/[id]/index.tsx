import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { useMessages } from '@/features/chat/hooks/useMessages'
import { useMessagesMutations } from '@/features/chat/hooks/useMessagesMutations'
import { useReadConversation } from '@/features/chat/hooks/useReadConversation'
import { useBlocks } from '@/features/chat/hooks/useBlocks'
import { useReportMessage } from '@/features/chat/hooks/useReportMessage'
import { newClientId } from '@/features/chat/hooks/useSendMessage'
import { useChatRealtimeStore } from '@/features/chat/store/chatRealtimeStore'
import { ensureRecordingPermission } from '@/features/chat/lib/audioRecording'
import type { VoiceNote } from '@/features/chat/hooks/useVoiceRecorder'
import { attachmentReplyLabel } from '@/features/chat/utils/attachmentPreview'
import { ConversationHeader } from '@/features/chat/components/ConversationHeader'
import { MessageList } from '@/features/chat/components/MessageList'
import { MessageInputBar } from '@/features/chat/components/MessageInputBar'
import { AudioRecorderBar } from '@/features/chat/components/AudioRecorderBar'
import { BlockedBanner } from '@/features/chat/components/BlockedBanner'
import { AttachmentMenu } from '@/features/chat/components/AttachmentMenu'
import { MessageActionsSheet } from '@/features/chat/components/MessageActionsSheet'
import { ReportReasonPicker } from '@/features/chat/components/ReportReasonPicker'
import { ImageViewerModal } from '@/features/chat/components/ImageViewerModal'
import type { UserMini } from '@/shared/types'
import type {
  ChatMessage,
  ReplyPreview,
  ReportReason,
} from '@/features/chat/types'

const COOLDOWN_MS = 5000

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const myId = useAuthStore(s => s.userId) ?? ''
  const showBanner = useBanner()
  const confirm = useConfirm()

  const { data: conversation, isLoading } = useConversation(id)
  const { messages } = useMessages(id)
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
  const me: UserMini = conversation?.participants.find(p => p.userId === myId)
    ?.user ?? {
    id: myId,
    name: '',
    lastname: '',
    username: '',
    avatarUrl: null,
  }

  const { send, sendImage, sendAudio, deleteMessage, edit } =
    useMessagesMutations(id, me)

  const [blockedByServer, setBlockedByServer] = useState(false)
  const iBlocked = other
    ? blocks.some(b => b.blocked.id === other.user.id)
    : false
  const isBlocked = !isGroup && (iBlocked || blockedByServer)

  const [cooldown, setCooldown] = useState(false)
  const [recording, setRecording] = useState(false)
  const [attachOpen, setAttachOpen] = useState(false)
  const [actionsFor, setActionsFor] = useState<ChatMessage | null>(null)
  const [reportFor, setReportFor] = useState<ChatMessage | null>(null)
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [editing, setEditing] = useState<ChatMessage | null>(null)
  const [replyingToId, setReplyingToId] = useState<string | null>(null)

  // Mensagem citada derivada do cache vivo (não um snapshot): se for apagada ou
  // sumir com a barra aberta, vira null e a barra fecha sozinha — evita citar e
  // enviar replyTo de uma mensagem que não existe mais.
  const replyingTo = useMemo(() => {
    if (!replyingToId) return null
    const m = messages.find(msg => msg.id === replyingToId)
    return m && !m.deletedAt ? m : null
  }, [messages, replyingToId])

  useEffect(() => {
    if (replyingToId && !replyingTo) setReplyingToId(null)
  }, [replyingToId, replyingTo])

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

  function toReplyPreview(m: ChatMessage): ReplyPreview {
    return {
      id: m.id,
      content: m.content,
      sender: m.sender,
      attachments: m.attachments,
      deletedAt: m.deletedAt,
    }
  }

  function setReply(message: ChatMessage) {
    // Só responde a mensagens persistidas e não removidas.
    if (message.deletedAt || message.clientStatus) return
    setEditing(null)
    setReplyingToId(message.id)
  }

  function sendText(text: string) {
    hapticLight()
    send.mutate(
      {
        content: text,
        clientId: newClientId(),
        replyTo: replyingTo ? toReplyPreview(replyingTo) : null,
      },
      { onError: handleSendError },
    )
    setReplyingToId(null)
  }

  function sendImageUri(uri: string) {
    hapticLight()
    sendImage.mutate(
      {
        uri,
        clientId: newClientId(),
        replyTo: replyingTo ? toReplyPreview(replyingTo) : null,
      },
      { onError: handleSendError },
    )
    setReplyingToId(null)
  }

  function sendAudioNote(note: VoiceNote) {
    hapticLight()
    sendAudio.mutate(
      {
        uri: note.uri,
        durationMs: note.durationMs,
        waveform: note.waveform,
        clientId: newClientId(),
      },
      { onError: handleSendError },
    )
    // Áudio não carrega replyTo; encerra a citação se houver.
    setReplyingToId(null)
  }

  async function startRecording() {
    const granted = await ensureRecordingPermission()
    if (!granted) {
      showBanner('Permissão de microfone negada.')
      return
    }
    setEditing(null)
    setRecording(true)
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
    const attachment = message.attachments[0]
    if (attachment?.kind === 'AUDIO') {
      sendAudio.mutate(
        {
          uri: attachment.url,
          durationMs: attachment.durationMs ?? 0,
          waveform: attachment.waveform ?? [],
          clientId: message.clientId,
        },
        { onError: handleSendError },
      )
      return
    }
    // Preserva a resposta original ao reenviar.
    const replyTo = message.replyTo ?? null
    if (attachment) {
      sendImage.mutate(
        {
          uri: attachment.url,
          clientId: message.clientId,
          replyTo,
        },
        { onError: handleSendError },
      )
    } else if (message.content) {
      send.mutate(
        { content: message.content, clientId: message.clientId, replyTo },
        { onError: handleSendError },
      )
    }
  }

  function openActions(message: ChatMessage) {
    if (message.deletedAt || message.clientStatus) return
    setActionsFor(message)
  }

  const isMineMessage = actionsFor?.senderId === myId
  const canEdit = !!actionsFor && isMineMessage && !!actionsFor.content
  const canDelete = !!actionsFor && (isMineMessage || (!!isGroup && !!amAdmin))
  const canReport = !!actionsFor && !isMineMessage

  async function doCopy() {
    if (actionsFor?.content) await Clipboard.setStringAsync(actionsFor.content)
  }

  async function confirmDelete(message: ChatMessage) {
    const ok = await confirm({
      title: 'Apagar mensagem',
      message: 'Esta mensagem será apagada para todos.',
      confirmLabel: 'Apagar',
      destructive: true,
    })
    if (ok) deleteMessage.mutate(message.id)
  }

  function doDelete() {
    if (actionsFor) confirmDelete(actionsFor)
  }

  function startEdit(message: ChatMessage) {
    setActionsFor(null)
    setReplyingToId(null)
    setEditing(message)
  }

  function submitEdit(text: string) {
    if (!editing) return
    edit.mutate(
      { messageId: editing.id, content: text },
      { onError: handleSendError },
    )
    setEditing(null)
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
          participants={conversation.participants}
          onLongPressMessage={openActions}
          onPressImage={setViewerUrl}
          onRetry={onRetry}
          onReplyMessage={setReply}
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
      ) : recording ? (
        <AudioRecorderBar
          onSend={note => {
            setRecording(false)
            sendAudioNote(note)
          }}
          onCancel={() => setRecording(false)}
        />
      ) : (
        <MessageInputBar
          onSendText={sendText}
          onAttach={() => setAttachOpen(true)}
          onStartRecording={startRecording}
          disabled={cooldown}
          editing={
            editing ? { id: editing.id, content: editing.content ?? '' } : null
          }
          onSubmitEdit={submitEdit}
          onCancelEdit={() => setEditing(null)}
          replyingTo={
            replyingTo
              ? {
                  senderName:
                    replyingTo.senderId === myId
                      ? 'Você'
                      : `${replyingTo.sender.name} ${replyingTo.sender.lastname}`.trim(),
                  preview: replyingTo.deletedAt
                    ? 'Mensagem removida'
                    : (replyingTo.content ??
                      attachmentReplyLabel(replyingTo.attachments)),
                }
              : null
          }
          onCancelReply={() => setReplyingToId(null)}
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
        canEdit={canEdit}
        canDelete={canDelete}
        canReport={canReport}
        onClose={() => setActionsFor(null)}
        onCopy={doCopy}
        onEdit={() => actionsFor && startEdit(actionsFor)}
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
