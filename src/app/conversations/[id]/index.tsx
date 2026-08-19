import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useLocale } from '@/shared/hooks/useLocale'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { isAxiosError } from 'axios'
import * as ImagePicker from 'expo-image-picker'
import * as Clipboard from 'expo-clipboard'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useBanner } from '@/shared/lib/banner'
import { useConfirm } from '@/shared/lib/confirm'
import { getApiError, isForbiddenError } from '@/shared/lib/apiError'
import { hapticLight } from '@/shared/lib/haptics'
import { useConversation } from '@/features/chat/hooks/useConversation'
import { useMessages } from '@/features/chat/hooks/useMessages'
import { useMessagesMutations } from '@/features/chat/hooks/useMessagesMutations'
import { useReadConversation } from '@/features/chat/hooks/useReadConversation'
import { useToggleReaction } from '@/features/chat/hooks/useToggleReaction'
import { useTypingSender } from '@/features/chat/hooks/useTypingSender'
import { useTypingUsers } from '@/features/chat/hooks/useTypingUsers'
import { useBlocks } from '@/features/chat/hooks/useBlocks'
import { useReportFlow } from '@/features/reports/hooks/useReportFlow'
import { newClientId } from '@/features/chat/hooks/useSendMessage'
import { useChatRealtimeStore } from '@/features/chat/store/chatRealtimeStore'
import { ensureRecordingPermission } from '@/features/chat/lib/audioRecording'
import type { VoiceNote } from '@/features/chat/hooks/useVoiceRecorder'
import { attachmentReplyLabel } from '@/features/chat/utils/attachmentPreview'
import { myReaction } from '@/features/chat/utils/reactions'
import { typingLabel } from '@/features/chat/utils/typing'
import { ConversationHeader } from '@/features/chat/components/ConversationHeader'
import { MessageList } from '@/features/chat/components/MessageList'
import { MessageInputBar } from '@/features/chat/components/MessageInputBar'
import { AudioRecorderBar } from '@/features/chat/components/AudioRecorderBar'
import { BlockedBanner } from '@/features/chat/components/BlockedBanner'
import { AttachmentMenu } from '@/features/chat/components/AttachmentMenu'
import { MessageActionsSheet } from '@/features/chat/components/MessageActionsSheet'
import { ReportReasonSheet } from '@/features/reports/components/ReportReasonSheet'
import { ImageViewerModal } from '@/features/chat/components/ImageViewerModal'
import { VideoPlayerModal } from '@/features/chat/components/VideoPlayerModal'
import type { UserMini } from '@/shared/types'
import type { ChatMessage, ReplyPreview } from '@/features/chat/types'
import { colors } from '@/shared/theme'

const COOLDOWN_MS = 5000
// Guarda pré-upload (nicety) — o limite real é do backend (413). Pega só vídeos
// absurdamente grandes antes de gastar banda subindo ao Cloudinary.
const MAX_VIDEO_BYTES = 50 * 1024 * 1024
// Teto de gravação na câmera (segundos).
const VIDEO_MAX_DURATION_S = 60

export default function ConversationScreen() {
  const { t } = useTranslation()
  const locale = useLocale()
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const myId = useAuthStore(s => s.userId) ?? ''
  const showBanner = useBanner()
  const confirm = useConfirm()

  const { data: conversation, isLoading } = useConversation(id)
  const { messages } = useMessages(id)
  const setActive = useChatRealtimeStore(s => s.setActiveConversation)
  const read = useReadConversation()
  const report = useReportFlow()
  const { blocks } = useBlocks()
  const toggleReaction = useToggleReaction(id, myId)
  const typingSender = useTypingSender(id)
  const typingUserIds = useTypingUsers(id)

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

  const { send, sendImage, sendAudio, sendVideo, deleteMessage, edit } =
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
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
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

  // Quem está digitando, em primeiro nome. O servidor não devolve typing pro
  // próprio autor, mas filtramos myId por garantia.
  const typingMessage = useMemo(() => {
    if (!conversation || typingUserIds.length === 0) return ''
    const names = typingUserIds
      .filter(uid => uid !== myId)
      .map(
        uid => conversation.participants.find(p => p.userId === uid)?.user.name,
      )
      .filter((name): name is string => !!name)
    return typingLabel(names, locale)
  }, [conversation, typingUserIds, myId, locale])

  // Marca a conversa como ativa (controla unread/read) e a marca lida ao focar.
  // Ao sair (blur/unmount) encerra qualquer "digitando" pendente. Refs evitam
  // re-rodar o efeito quando read/typingSender mudam de identidade.
  const readRef = useRef(read)
  readRef.current = read
  const stopTypingRef = useRef(typingSender.stop)
  stopTypingRef.current = typingSender.stop
  useFocusEffect(
    useCallback(() => {
      setActive(id)
      readRef.current.mutate(id)
      return () => {
        setActive(null)
        stopTypingRef.current()
      }
    }, [id, setActive]),
  )

  function handleSendError(e: unknown) {
    if (isAxiosError(e) && e.response?.status === 429) {
      showBanner(t('chat.banners.rateLimited'))
      setCooldown(true)
      setTimeout(() => setCooldown(false), COOLDOWN_MS)
      return
    }
    if (isForbiddenError(e) && !isGroup) {
      setBlockedByServer(true)
      return
    }
    // 400 (ex.: GIF não suportado), 413 (arquivo > limite OU cota de mídia) e 404
    // saem com a mensagem do backend (PT) verbatim. Os dois 413 distintos vêm
    // diferenciados no próprio {message}. O revert da bolha pra 'failed' continua
    // no onError da mutation — os dois onError rodam (a bolha falha E o banner sai).
    const status = isAxiosError(e) ? e.response?.status : undefined
    if (status === 400 || status === 413 || status === 404) {
      showBanner(getApiError(e).message)
    }
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

  function sendImageUri(uri: string, width?: number, height?: number) {
    hapticLight()
    sendImage.mutate(
      {
        uri,
        clientId: newClientId(),
        width,
        height,
        replyTo: replyingTo ? toReplyPreview(replyingTo) : null,
      },
      { onError: handleSendError },
    )
    setReplyingToId(null)
  }

  function sendVideoUri(asset: ImagePicker.ImagePickerAsset) {
    // fileSize é frequentemente undefined no Android — aí o 413 do backend é a
    // guarda real. Quando presente, evita subir um arquivo gigante à toa.
    if (asset.fileSize != null && asset.fileSize > MAX_VIDEO_BYTES) {
      showBanner(t('chat.banners.videoTooLarge'))
      return
    }
    hapticLight()
    sendVideo.mutate(
      {
        uri: asset.uri,
        clientId: newClientId(),
        width: asset.width,
        height: asset.height,
        durationMs: asset.duration ?? undefined,
      },
      { onError: handleSendError },
    )
    // Vídeo não carrega replyTo; encerra a citação se houver.
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
      showBanner(t('chat.banners.micDenied'))
      return
    }
    setEditing(null)
    setRecording(true)
  }

  async function pickFromGallery() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
    })
    if (res.canceled || !res.assets[0]) return
    const asset = res.assets[0]
    if (asset.type === 'video') sendVideoUri(asset)
    else sendImageUri(asset.uri, asset.width, asset.height)
  }

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) {
      showBanner(t('chat.banners.cameraDenied'))
      return
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
      videoMaxDuration: VIDEO_MAX_DURATION_S,
    })
    if (res.canceled || !res.assets[0]) return
    const asset = res.assets[0]
    if (asset.type === 'video') sendVideoUri(asset)
    else sendImageUri(asset.uri, asset.width, asset.height)
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
    if (attachment?.kind === 'VIDEO') {
      // publicId presente → o upload ao Cloudinary já tinha completado; reusa e
      // pula direto pra criar a mensagem (mesmo clientId = mesma Idempotency-Key).
      sendVideo.mutate(
        {
          uri: attachment.url,
          clientId: message.clientId,
          width: attachment.width,
          height: attachment.height,
          durationMs: attachment.durationMs,
          publicId: attachment.publicId,
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
          width: attachment.width,
          height: attachment.height,
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
  // Reagir não vale em mensagem de sistema, apagada nem ainda não persistida (o
  // id ainda é de cliente). `openActions` já barra clientStatus, mas manter aqui
  // deixa o predicado completo e robusto a novos pontos de entrada.
  const canReact =
    !!actionsFor &&
    !actionsFor.deletedAt &&
    actionsFor.type !== 'SYSTEM' &&
    !actionsFor.clientStatus
  const myEmoji = actionsFor ? myReaction(actionsFor.reactions, myId) : null

  function reactTo(message: ChatMessage, emoji: string) {
    hapticLight()
    toggleReaction.mutate({ message, emoji })
  }

  async function doCopy() {
    if (actionsFor?.content) await Clipboard.setStringAsync(actionsFor.content)
  }

  async function confirmDelete(message: ChatMessage) {
    const ok = await confirm({
      title: t('chat.actions.deleteTitle'),
      message: t('chat.actions.deleteMessage'),
      confirmLabel: t('chat.actions.delete'),
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
    // Sai do modo "compondo": encerra qualquer "digitando" pendente (editar não
    // dispara typing, então sem isto o indicador ficaria preso até o debounce).
    typingSender.stop()
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

  if (isLoading || !conversation) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.brandEmphasis} />
      </View>
    )
  }

  // Sem keyboardVerticalOffset: o inset do topo virou padding da própria tela
  // (contentStyle no _layout raiz), então o onLayout daqui já sai na posição
  // real da janela e a conta do teclado fecha sem compensação manual.
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background"
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
          typingLabel={typingMessage}
          onLongPressMessage={openActions}
          onPressImage={setViewerUrl}
          onPressVideo={setVideoUrl}
          onRetry={onRetry}
          onReplyMessage={setReply}
          onToggleReaction={reactTo}
        />
      </View>

      {isBlocked ? (
        <BlockedBanner
          message={iBlocked ? t('chat.blocked.byMe') : t('chat.blocked.byThem')}
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
                      ? t('chat.conversation.you')
                      : `${replyingTo.sender.name} ${replyingTo.sender.lastname}`.trim(),
                  preview: replyingTo.deletedAt
                    ? t('chat.message.deleted')
                    : (replyingTo.content ??
                      attachmentReplyLabel(replyingTo.attachments, locale)),
                }
              : null
          }
          onCancelReply={() => setReplyingToId(null)}
          onTyping={typingSender.onType}
          onStopTyping={typingSender.stop}
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
        canReact={canReact}
        myEmoji={myEmoji}
        onClose={() => setActionsFor(null)}
        onReact={emoji => actionsFor && reactTo(actionsFor, emoji)}
        onCopy={doCopy}
        onEdit={() => actionsFor && startEdit(actionsFor)}
        onReport={() =>
          actionsFor &&
          report.requestReport({ type: 'message', id: actionsFor.id })
        }
        onDelete={doDelete}
      />
      <ReportReasonSheet
        target={report.target}
        onClose={report.close}
        onSubmit={report.submit}
      />
      <ImageViewerModal url={viewerUrl} onClose={() => setViewerUrl(null)} />
      <VideoPlayerModal url={videoUrl} onClose={() => setVideoUrl(null)} />
    </KeyboardAvoidingView>
  )
}
