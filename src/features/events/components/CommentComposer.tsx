import { useState } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import { PaperPlaneTiltIcon, XIcon } from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { useMe } from '@/features/auth/hooks/useMe'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { FormError } from '@/shared/components/FormError'
import { getApiError } from '@/shared/lib/apiError'
import { colors } from '@/shared/theme'

type Props = {
  // Rejeitar = erro tratado aqui (texto de volta + linha inline). Quem chama
  // decide o que é enviar: comentário na raiz ou resposta numa thread.
  onSubmit: (content: string) => Promise<unknown>
  placeholder?: string
  // Username de quem está sendo respondido — a faixa acima do campo é o que
  // diz que o envio NÃO vai virar comentário solto.
  replyingTo?: string
  onCancelReply?: () => void
  autoFocus?: boolean
  // Foco no campo abre a seção junto — comentar e ler são o mesmo gesto.
  onFocus?: () => void
  // Quando o contexto não libera comentar (ex.: sem RSVP no feed do evento),
  // a pílula dá lugar à faixa com o motivo.
  disabled?: boolean
  disabledReason?: string
}

const AVATAR = 24

/**
 * Campo de comentar em pílula — o rodapé fixo do card, visível esteja a seção
 * aberta ou fechada. Existe um só por card: quando a lista expande ela cresce
 * ACIMA daqui, então o campo nunca duplica.
 *
 * O envio é otimista (useAddComment); em falha o texto volta pro campo com a
 * mensagem inline, porque digitação perdida é pior que uma linha de erro.
 */
export function CommentComposer({
  onSubmit,
  placeholder,
  replyingTo,
  onCancelReply,
  autoFocus,
  onFocus,
  disabled,
  disabledReason,
}: Props) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { data: me } = useMe()

  if (disabled) {
    return (
      <View className="mx-4 mb-3 rounded-xl bg-surface-elevated px-4 py-3">
        <Text className="text-sm text-content-secondary">
          {disabledReason ?? t('events.comments.cannotComment')}
        </Text>
      </View>
    )
  }

  const filled = !!text.trim()

  function handleSend() {
    const content = text.trim()
    if (!content) return
    setText('')
    setError(null)
    onSubmit(content).catch(e => {
      // Devolve o texto: o comentário otimista já saiu da lista no rollback.
      setText(content)
      setError(getApiError(e).message)
    })
  }

  return (
    <View className="mx-4 mb-3 gap-1.5">
      {!!replyingTo && (
        <View className="flex-row items-center justify-between px-3">
          <Text className="text-xs text-content-muted">
            {t('events.comments.replyingTo', { username: replyingTo })}
          </Text>
          <Pressable
            onPress={onCancelReply}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('events.comments.cancelReply')}
          >
            <XIcon size={14} color={colors.contentMuted} />
          </Pressable>
        </View>
      )}
      <View className="flex-row items-center gap-2 rounded-full border border-line px-3 py-2.5">
        <UserAvatar
          name={me?.name ?? ''}
          avatarUrl={me?.avatarUrl}
          size={AVATAR}
        />
        <TextInput
          // min-h dá corpo ao campo de uma linha; sem ele o multiline colapsa
          // na altura da fonte e a pílula fica apertada.
          className="max-h-24 min-h-7 flex-1 text-sm text-content"
          textAlignVertical="center"
          placeholder={placeholder ?? t('events.comments.composerPlaceholder')}
          placeholderTextColor={colors.contentSubtle}
          value={text}
          onChangeText={setText}
          autoFocus={autoFocus}
          onFocus={onFocus}
          onSubmitEditing={handleSend}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={handleSend}
          disabled={!filled}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('events.comments.send')}
          className="h-7 w-7 items-center justify-center"
        >
          <PaperPlaneTiltIcon
            size={18}
            weight={filled ? 'fill' : 'regular'}
            color={filled ? colors.content : colors.contentMuted}
          />
        </Pressable>
      </View>
      <FormError message={error} />
    </View>
  )
}
