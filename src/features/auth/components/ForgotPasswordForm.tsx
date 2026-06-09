import { useRef, useState } from 'react'
import { Animated, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useForgotPassword } from '../hooks/useForgotPassword'
import { useResetPassword } from '../hooks/useResetPassword'
import { useLogin } from '../hooks/useLogin'
import { useCountdown } from '@/shared/hooks/useCountdown'
import { useBanner } from '@/shared/lib/banner'
import {
  isTooManyRequestsError,
  isValidationError,
} from '@/shared/lib/apiError'
import type { ResetPasswordInput } from '../schemas/forgotPasswordSchema'
import { StepEmail } from './forgot-password-steps/StepEmail'
import { StepCode } from './forgot-password-steps/StepCode'
import { StepNewPassword } from './forgot-password-steps/StepNewPassword'
import { StepSuccess } from './forgot-password-steps/StepSuccess'

const STEP_ORDER = ['email', 'code', 'password', 'success'] as const
type Step = (typeof STEP_ORDER)[number]

const RESEND_COOLDOWN = 60

type Props = {
  defaultEmail?: string
}

export function ForgotPasswordForm({ defaultEmail }: Props) {
  const router = useRouter()
  const forgot = useForgotPassword()
  const reset = useResetPassword()
  const login = useLogin()
  const resend = useCountdown()
  const showBanner = useBanner()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState(defaultEmail ?? '')
  const [code, setCode] = useState('')
  // Falhas de reset com o código atual; após 2, sugerimos pedir um novo (§5).
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [forgotError, setForgotError] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)
  // Senha guardada em memória entre o reset e o "Entrar no app" da tela de sucesso.
  const [pendingPassword, setPendingPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)

  const slideAnim = useRef(new Animated.Value(0)).current

  function goToStep(next: Step) {
    const forward = STEP_ORDER.indexOf(next) >= STEP_ORDER.indexOf(step)
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: forward ? -30 : 30,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start()
    setStep(next)
  }

  function handleForgotError(error: unknown) {
    if (isTooManyRequestsError(error)) {
      showBanner('Muitas solicitações. Tente novamente em instantes.')
      return
    }
    setForgotError('Não foi possível enviar agora. Tente novamente.')
  }

  function handleEmailSubmit(value: string) {
    setForgotError(null)
    forgot.mutate(value, {
      // Anti-enumeração: backend responde 200 mesmo se a conta não existir.
      onSuccess: () => {
        setEmail(value)
        setCode('')
        setFailedAttempts(0)
        setResetError(null)
        goToStep('code')
        resend.start(RESEND_COOLDOWN)
      },
      onError: handleForgotError,
    })
  }

  function handleResend() {
    setForgotError(null)
    // Reenviar invalida o código anterior — zera input e contador local.
    forgot.mutate(email, {
      onSuccess: () => {
        setCode('')
        setFailedAttempts(0)
        setResetError(null)
        resend.start(RESEND_COOLDOWN)
      },
      onError: handleForgotError,
    })
  }

  function handleResetError(error: unknown) {
    if (isTooManyRequestsError(error)) {
      showBanner('Muitas tentativas. Aguarde um momento e tente novamente.')
      return
    }
    // 400 é genérico (errado/expirado/travado); escala a copy após 2 falhas.
    if (isValidationError(error)) {
      const next = failedAttempts + 1
      setFailedAttempts(next)
      setResetError(
        next >= 2
          ? 'O código pode ter expirado ou está incorreto. Peça um novo código.'
          : 'Código inválido ou expirado. Verifique e tente novamente.',
      )
      return
    }
    setResetError('Não foi possível redefinir agora. Tente novamente.')
  }

  function handleResetSubmit(data: ResetPasswordInput) {
    setResetError(null)
    reset.mutate(
      { email: data.email, code: data.code, newPassword: data.newPassword },
      {
        // Reset não retorna token. Guardamos a senha em memória e só entramos no
        // app quando o usuário confirmar — senão a tela de sucesso some no ato.
        onSuccess: () => {
          setPendingPassword(data.newPassword)
          setLoginError(null)
          goToStep('success')
        },
        onError: handleResetError,
      },
    )
  }

  function handleEnterApp() {
    setLoginError(null)
    // Login normal com a nova senha; no sucesso o AuthGuard leva pro app.
    login.mutate(
      { email, password: pendingPassword },
      {
        onError: () =>
          setLoginError('Não foi possível entrar agora. Tente novamente.'),
      },
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
        {step === 'email' && (
          <StepEmail
            defaultEmail={email}
            onSubmit={handleEmailSubmit}
            isSubmitting={forgot.isPending}
            serverError={forgotError}
          />
        )}
        {step === 'code' && (
          <StepCode
            email={email}
            code={code}
            onChangeCode={setCode}
            onProceed={() => goToStep('password')}
            onBack={() => goToStep('email')}
            onResend={handleResend}
            resendIn={resend.secondsLeft}
            isResending={forgot.isPending}
          />
        )}
        {step === 'password' && (
          <StepNewPassword
            email={email}
            code={code}
            onSubmit={handleResetSubmit}
            onBack={() => goToStep('code')}
            isSubmitting={reset.isPending}
            resetError={resetError}
            showResendHint={failedAttempts >= 2}
          />
        )}
        {step === 'success' && (
          <StepSuccess
            isLoggingIn={login.isPending}
            loginError={loginError}
            onEnter={handleEnterApp}
            onGoToLogin={() =>
              router.replace({
                pathname: '/(auth)/login',
                params: { email },
              })
            }
          />
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  )
}
