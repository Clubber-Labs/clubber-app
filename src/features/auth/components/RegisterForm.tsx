import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, Animated } from 'react-native'
import { useForm, useWatch, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  REGISTER_STEP_FIELDS,
  registerSchema,
  registerStepSchemas,
  type RegisterInput,
} from '../schemas/registerSchema'
import { MIN_PREFERRED_CATEGORIES } from '@/shared/utils/rolePreferences'
import { useRegister } from '../hooks/useRegister'
import { Button } from '@/shared/components/Button'
import { FormSubmitButton } from '@/shared/components/FormSubmitButton'
import { useFormFocus } from '@/shared/lib/formFocus'
import { RegisterProgressBar } from './RegisterProgressBar'
import { StepPersonal } from './steps/StepPersonal'
import { StepAccount } from './steps/StepAccount'
import { StepPassword } from './steps/StepPassword'
import { StepProfile } from './steps/StepProfile'
import { LegalNotice } from './LegalNotice'
import { getApiError } from '@/shared/lib/apiError'
import { resolveConflictField } from '@/shared/utils/conflictField'
import {
  useFormErrorBanner,
  messagesFromErrors,
} from '@/shared/hooks/useFormErrorBanner'

const STEPS = REGISTER_STEP_FIELDS

// Subconjunto do STEPS que precisa estar preenchido pro avanço liberar — o que
// fica de fora é opcional (bio) ou já tem default (isPrivate, consents).
const STEP_REQUIRED: (keyof RegisterInput)[][] = [
  ['name', 'lastname', 'birthdate'],
  ['username', 'email', 'phone'],
  ['password', 'confirmPassword'],
  ['preferredCategories'],
]

const FIELD_TO_STEP = new Map<keyof RegisterInput, number>(
  STEPS.flatMap((fields, step) => fields.map(field => [field, step] as const)),
)

// O 409 do backend já diz o campo em `field` e a copy vem traduzida do
// dicionário — aqui só declaramos quais campos deste form podem conflitar.
const CONFLICT_FIELDS = ['phone', 'email', 'username'] as const

export function RegisterForm() {
  const { t } = useTranslation()
  const { mutate: register, isPending } = useRegister()
  const [currentStep, setCurrentStep] = useState(0)
  const [genericError, setGenericError] = useState<string | null>(null)
  const progress = useRef(new Animated.Value(1 / STEPS.length)).current
  const slideAnim = useRef(new Animated.Value(0)).current

  const {
    control,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      isPrivate: false,
      preferredCategories: [],
    },
  })

  const form = useFormFocus()

  const showFormErrors = useFormErrorBanner(form)
  const totalSteps = STEPS.length
  const isLastStep = currentStep === totalSteps - 1

  // Etapa de rolês é obrigatória: trava o avanço até escolher ao menos 2
  // categorias (o schema também valida no trigger, isto só dá o feedback visual).
  const watchedCategories = useWatch({ control, name: 'preferredCategories' })
  const rolesStepBlocked =
    STEPS[currentStep].includes('preferredCategories') &&
    (watchedCategories?.length ?? 0) < MIN_PREFERRED_CATEGORIES

  function goToStep(index: number, direction: 'forward' | 'back') {
    const toValue = direction === 'forward' ? -30 : 30
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start()
    setCurrentStep(index)
    Animated.timing(progress, {
      toValue: (index + 1) / totalSteps,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }

  // Valida contra o schema DA ETAPA, não com trigger() campo a campo: o trigger
  // roda o schema inteiro e as regras entre campos ficam de fora enquanto as
  // etapas seguintes estão vazias (ver registerStepSchemas). O erro precisa
  // aparecer aqui, no campo que o causou, e não no submit lá na frente.
  function handleNext() {
    const fields = STEPS[currentStep]
    clearErrors(fields)

    const result = registerStepSchemas[currentStep].safeParse(getValues())
    if (result.success) {
      goToStep(currentStep + 1, 'forward')
      return
    }

    const messages: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof RegisterInput
      if (messages[field]) continue
      messages[field] = issue.message
      setError(field, { message: issue.message })
    }
    // Banner + borda + foco: o texto sob o input saiu do app (ver
    // useFormErrorBanner), então é aqui que a etapa comunica o que falta.
    void showFormErrors(messages)
  }

  function handleBack() {
    if (currentStep === 0) return
    goToStep(currentStep - 1, 'back')
  }

  function handleApiError(error: unknown) {
    setGenericError(null)
    const fieldError = resolveConflictField(error, CONFLICT_FIELDS)
    if (fieldError) {
      setError(fieldError.field, { message: fieldError.message })
      const targetStep = FIELD_TO_STEP.get(fieldError.field)
      if (targetStep !== undefined && targetStep !== currentStep)
        goToStep(targetStep, 'back')
    } else {
      setGenericError(getApiError(error).message)
    }
  }

  // Rede de segurança do submit final: um erro que sobrou de etapa anterior
  // aponta pra um campo que nem está montado, então focar nele não faz nada e o
  // botão "Criar conta" parece morto. Volta pra primeira etapa com erro.
  function handleInvalidSubmit(formErrors: FieldErrors<RegisterInput>) {
    const steps = Object.keys(formErrors)
      .map(field => FIELD_TO_STEP.get(field as keyof RegisterInput))
      .filter((step): step is number => step !== undefined)
    const target = steps.length ? Math.min(...steps) : currentStep
    if (target !== currentStep) {
      goToStep(target, 'back')
      return
    }
    void showFormErrors(messagesFromErrors(formErrors))
  }

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  const steps = [
    <StepPersonal control={control} errors={errors} />,
    <StepAccount control={control} errors={errors} />,
    <StepPassword control={control} errors={errors} />,
    <StepProfile control={control} errors={errors} />,
  ]

  return (
    <>
      <View className="gap-6">
        <RegisterProgressBar
          current={currentStep}
          total={totalSteps}
          progressWidth={progressWidth}
        />

        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
          {steps[currentStep]}
        </Animated.View>

        {genericError && (
          <View className="bg-surface border border-content rounded-xl px-4 py-3">
            <Text className="text-content text-sm">{genericError}</Text>
          </View>
        )}

        <View className="flex-row gap-3">
          {currentStep > 0 && (
            <View className="flex-1">
              <Button
                label={t('common.back')}
                onPress={handleBack}
                variant="secondary"
              />
            </View>
          )}
          <View className="flex-1">
            {isLastStep ? (
              <FormSubmitButton
                control={control}
                required={STEP_REQUIRED[currentStep]}
                label={
                  isPending
                    ? t('auth.register.creating')
                    : t('auth.register.create')
                }
                onPress={handleSubmit(data => {
                  setGenericError(null)
                  register(data, { onError: handleApiError })
                }, handleInvalidSubmit)}
                loading={isPending}
              />
            ) : (
              // A disponibilidade do username NÃO entra aqui de propósito: ela
              // pode estar indefinida por rede ou 429, e travar o avanço num
              // resultado que talvez nem tenha chegado transforma um extra em
              // bloqueio. Quem recusa de fato é o 409 do submit.
              <FormSubmitButton
                control={control}
                required={STEP_REQUIRED[currentStep]}
                label={t('common.continue')}
                onPress={handleNext}
                disabled={rolesStepBlocked}
              />
            )}
          </View>
        </View>

        {isLastStep && <LegalNotice />}
      </View>
    </>
  )
}
