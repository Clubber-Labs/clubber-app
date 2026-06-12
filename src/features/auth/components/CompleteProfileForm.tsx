import { useRef, useState } from 'react'
import { View, Animated } from 'react-native'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  completeProfileSchema,
  type CompleteProfileInput,
} from '../schemas/completeProfileSchema'
import { useCompleteProfile } from '../hooks/useCompleteProfile'
import { RegisterProgressBar } from './RegisterProgressBar'
import { StepIdentity } from './complete-profile-steps/StepIdentity'
import { StepAccount } from './complete-profile-steps/StepAccount'
import { StepInterests } from './complete-profile-steps/StepInterests'
import { Button } from '@/shared/components/Button'
import { useBanner } from '@/shared/lib/banner'
import { getApiError, isConflictError } from '@/shared/lib/apiError'
import { getConflictMessage } from '@/shared/utils/conflictMessage'
import { parseLocalDate, toLocalIsoDate } from '@/shared/utils/dateFormat'
import type { UserProfile } from '@/shared/types'

type Props = {
  profile: UserProfile
}

const STEPS: (keyof CompleteProfileInput)[][] = [
  ['name', 'lastname', 'birthdate'],
  ['username', 'phone'],
  ['bio', 'isPrivate', 'preferredCategories'],
]

const FIELD_TO_STEP: Partial<Record<keyof CompleteProfileInput, number>> = {
  name: 0,
  lastname: 0,
  birthdate: 0,
  username: 1,
  phone: 1,
  bio: 2,
  isPrivate: 2,
  preferredCategories: 2,
}

const CONFLICT_FIELD_MAP: {
  keyword: string
  field: 'phone' | 'username'
  message: string
}[] = [
  { keyword: 'telefone', field: 'phone', message: 'Telefone já cadastrado.' },
  { keyword: 'phone', field: 'phone', message: 'Telefone já cadastrado.' },
  {
    keyword: 'usuário',
    field: 'username',
    message: 'Nome de usuário já está em uso.',
  },
  {
    keyword: 'username',
    field: 'username',
    message: 'Nome de usuário já está em uso.',
  },
]

// Inclui preferredCategories (default []) — sem isso o zod do completeProfile
// (que estende editProfile, onde o campo é obrigatório) falha silenciosamente
// e o "Concluir" não fazia nada.
function defaultsFromProfile(
  profile: UserProfile,
): Partial<CompleteProfileInput> {
  return {
    name: profile.name ?? '',
    lastname: profile.lastname ?? '',
    username: profile.username ?? '',
    phone: profile.phone ?? '',
    bio: profile.bio ?? '',
    isPrivate: profile.isPrivate ?? false,
    birthdate: profile.birthdate
      ? parseLocalDate(profile.birthdate)
      : undefined,
    preferredCategories: profile.preferredCategories ?? [],
  }
}

export function CompleteProfileForm({ profile }: Props) {
  const { mutate: complete, isPending } = useCompleteProfile(profile.id)
  const showBanner = useBanner()
  const [currentStep, setCurrentStep] = useState(0)
  const progress = useRef(new Animated.Value(1 / STEPS.length)).current
  const slideAnim = useRef(new Animated.Value(0)).current

  const {
    control,
    handleSubmit,
    trigger,
    setError,
    formState: { errors },
  } = useForm<CompleteProfileInput>({
    resolver: zodResolver(completeProfileSchema),
    mode: 'onTouched',
    defaultValues: defaultsFromProfile(profile),
  })

  const totalSteps = STEPS.length
  const isLastStep = currentStep === totalSteps - 1

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

  async function handleNext() {
    const valid = await trigger(STEPS[currentStep])
    if (!valid) return
    goToStep(currentStep + 1, 'forward')
  }

  function handleBack() {
    if (currentStep === 0) return
    goToStep(currentStep - 1, 'back')
  }

  function handleApiError(error: unknown) {
    if (isConflictError(error)) {
      const lower = getApiError(error).message.toLowerCase()
      const match = CONFLICT_FIELD_MAP.find(m => lower.includes(m.keyword))
      if (match) {
        setError(match.field, { message: match.message })
        const step = FIELD_TO_STEP[match.field]
        if (step !== undefined && step !== currentStep) goToStep(step, 'back')
        return
      }
    }
    showBanner(
      getConflictMessage(error) ??
        'Não foi possível salvar suas informações. Verifique sua conexão e tente de novo.',
    )
  }

  function onSubmit(values: CompleteProfileInput) {
    complete(
      {
        name: values.name,
        lastname: values.lastname,
        username: values.username,
        phone: values.phone,
        bio: values.bio,
        isPrivate: values.isPrivate,
        birthdate: toLocalIsoDate(values.birthdate),
        preferredCategories: values.preferredCategories,
      },
      { onError: handleApiError },
    )
  }

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  const steps = [
    <StepIdentity control={control} errors={errors} />,
    <StepAccount control={control} errors={errors} email={profile.email} />,
    <StepInterests control={control} errors={errors} />,
  ]

  return (
    <View className="gap-6">
      <RegisterProgressBar
        current={currentStep}
        total={totalSteps}
        progressWidth={progressWidth}
      />

      <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
        {steps[currentStep]}
      </Animated.View>

      <View className="flex-row gap-3">
        {currentStep > 0 && (
          <View className="flex-1">
            <Button label="Voltar" onPress={handleBack} variant="secondary" />
          </View>
        )}
        <View className="flex-1">
          {isLastStep ? (
            <Button
              label={isPending ? 'Salvando...' : 'Concluir'}
              onPress={handleSubmit(onSubmit)}
              loading={isPending}
            />
          ) : (
            <Button label="Continuar" onPress={handleNext} />
          )}
        </View>
      </View>
    </View>
  )
}
