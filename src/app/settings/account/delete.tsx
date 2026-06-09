import { useCallback, useState } from 'react'
import {
  View,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { isAxiosError } from 'axios'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import { useDeleteAccount } from '@/features/account/hooks/useDeleteAccount'
import { useExportConsentData } from '@/features/account/hooks/useExportConsentData'
import { useConfirm } from '@/shared/lib/confirm'
import { finalizeAccountExit } from '@/features/account/lib/finalizeAccountExit'
import { endSession } from '@/features/auth/lib/session'
import {
  buildReason,
  type DeleteReason,
} from '@/features/account/utils/deleteReasons'
import { getApiError, isTooManyRequestsError } from '@/shared/lib/apiError'
import { formatShortDate } from '@/shared/utils/dateFormat'
import { DeleteReasonStep } from '@/features/account/components/DeleteReasonStep'
import { DataLossWarning } from '@/features/account/components/DataLossWarning'
import { DeleteReauthStep } from '@/features/account/components/DeleteReauthStep'
import { AccountExitSuccess } from '@/features/account/components/AccountExitSuccess'

type Step = 'reason' | 'warning' | 'reauth'
type ExitInfo = { userId: string; scheduledDeletionAt: string | null }

export default function DeleteAccountScreen() {
  const router = useRouter()
  const { data: profile, isLoading } = useMyProfile()
  const deleteAccount = useDeleteAccount()
  const confirm = useConfirm()
  const { exportData, exporting, error: exportError } = useExportConsentData()

  const [step, setStep] = useState<Step>('reason')
  const [reason, setReason] = useState<DeleteReason | null>(null)
  const [otherText, setOtherText] = useState('')
  const [password, setPassword] = useState('')
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [exitInfo, setExitInfo] = useState<ExitInfo | null>(null)
  const [exiting, setExiting] = useState(false)

  // Nunca manter a senha em memória além do necessário: limpa ao sair da tela.
  useFocusEffect(useCallback(() => () => setPassword(''), []))

  function handleDeleteError(e: unknown) {
    if (isTooManyRequestsError(e)) {
      setInlineError('Muitas tentativas. Tente novamente em instantes.')
      return
    }
    if (isAxiosError(e)) {
      const status = e.response?.status
      const msg = (e.response?.data?.message as string | undefined) ?? ''
      // 401 sem "senha" = token/sessão inválido (ex: conta já anonimizada) →
      // encerra a sessão e vai pro login (skipAuthHandler evita o handler global).
      if (status === 401 && !/senha/i.test(msg)) {
        void endSession().then(() => router.replace('/(auth)/login'))
        return
      }
      if (status === 403) {
        setInlineError('Não foi possível excluir a conta.')
        return
      }
    }
    setInlineError(getApiError(e).message)
  }

  async function onConfirmDelete() {
    if (!profile) return
    const ok = await confirm({
      title: 'Excluir minha conta',
      message:
        'Sua conta será agendada para exclusão. Você terá 30 dias para cancelar fazendo login. Confirmar?',
      confirmLabel: 'Excluir minha conta',
      destructive: true,
    })
    if (!ok) return
    setInlineError(null)
    deleteAccount.mutate(
      {
        id: profile.id,
        password: profile.hasPassword ? password : undefined,
        reason: buildReason(reason, otherText),
      },
      {
        onSuccess: res => {
          // Captura a data ANTES do finalizeAccountExit limpar o cache.
          setExitInfo({
            userId: profile.id,
            scheduledDeletionAt: res.scheduledDeletionAt,
          })
        },
        onError: handleDeleteError,
        onSettled: () => setPassword(''),
      },
    )
  }

  async function onExit() {
    if (!exitInfo) return
    setExiting(true)
    await finalizeAccountExit({
      userId: exitInfo.userId,
      status: 'PENDING_DELETION',
      scheduledDeletionAt: exitInfo.scheduledDeletionAt,
    })
    router.replace('/(auth)/login')
  }

  // Sucesso vem antes do guard de loading: o finalizeAccountExit limpa o cache de
  // /me, então `profile` fica undefined enquanto navegamos — não pode cair no guard.
  if (exitInfo) {
    const dateLabel = exitInfo.scheduledDeletionAt
      ? formatShortDate(exitInfo.scheduledDeletionAt)
      : null
    return (
      <AccountExitSuccess
        title="Exclusão agendada"
        message={
          dateLabel
            ? `Sua conta será excluída em ${dateLabel}. Faça login antes dessa data para cancelar.`
            : 'Sua conta foi agendada para exclusão. Faça login dentro do prazo para cancelar.'
        }
        loading={exiting}
        onDone={onExit}
      />
    )
  }

  if (isLoading || !profile) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#7c3aed" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#000000' }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'reason' && (
          <DeleteReasonStep
            reason={reason}
            onReasonChange={setReason}
            otherText={otherText}
            onOtherTextChange={setOtherText}
            onContinue={() => setStep('warning')}
            onSkip={() => {
              setReason(null)
              setOtherText('')
              setStep('warning')
            }}
          />
        )}

        {step === 'warning' && (
          <DataLossWarning
            onExport={exportData}
            exporting={exporting}
            exportError={exportError}
            onContinue={() => setStep('reauth')}
            onBack={() => setStep('reason')}
          />
        )}

        {step === 'reauth' &&
          (profile.hasPassword === undefined ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator color="#7c3aed" />
            </View>
          ) : (
            <DeleteReauthStep
              hasPassword={profile.hasPassword}
              password={password}
              onPasswordChange={setPassword}
              error={inlineError}
              submitting={deleteAccount.isPending}
              onConfirm={onConfirmDelete}
              onBack={() => {
                setInlineError(null)
                setStep('warning')
              }}
            />
          ))}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
