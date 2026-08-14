import { useRef, useState } from 'react'
import { View, Animated } from 'react-native'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MIN_PREFERRED_CATEGORIES } from '@/shared/utils/rolePreferences'
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
import { FormSubmitButton } from '@/shared/components/FormSubmitButton'
import { useFormFocus } from '@/shared/lib/formFocus'
import { useBanner } from '@/shared/lib/banner'
import { getConflictMessage } from '@/shared/utils/conflictMessage'
import {
  resolveConflictField,
  type ConflictFieldEntry,
} from '@/shared/utils/conflictField'
import { parseLocalDate, toLocalIsoDate } from '@/shared/utils/dateFormat'
import type { UserProfile } from '@/shared/types'

type Props = {
  profile: UserProfile
}

const STEPS: (keyof CompleteProfileInput)[][] = [
  ['name', 'lastname', 'birthdate'],
  ['username', 'phone'],
  ['bio', 'isPrivate', 'preferredCategories', 'preferredSubcategories'],
]

// Subconjunto do STEPS que precisa estar preenchido pro avanço liberar.
const STEP_REQUIRED: (keyof CompleteProfileInput)[][] = [
  ['name', 'lastname', 'birthdate'],
  ['username', 'phone'],
  ['preferredCategories'],
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
  preferredSubcategories: 2,
}

// Este form salva via PUT /users/:id, cujo 409 nasce do tratador de unique
// constraint do Prisma e NÃO traz `field` — aqui o match por texto é o caminho
// principal, não o fallback (o resolveConflictField cobre os dois).
const CONFLICT_FIELD_MAP: ConflictFieldEntry<'phone' | 'username'>[] = [
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
    preferredSubcategories: profile.preferredSubcategories ?? [],
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

  const form = useFormFocus()
  const totalSteps = STEPS.length
  const isLastStep = currentStep === totalSteps - 1

  // Perfil mínimo obrigatório: trava o "Concluir" até escolher ao menos 2
  // categorias de rolê (o backend rejeita < 2 com 400 — bloqueia antes).
  const watchedCategories = useWatch({ control, name: 'preferredCategories' })
  const rolesBlocked =
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

  async function handleNext() {
    const fields = STEPS[currentStep]
    // Valida campo a campo pra saber QUAIS falharam: o `errors` do render atual
    // ainda é o de antes do trigger, então não serve pra localizar o erro.
    const results = await Promise.all(fields.map(name => trigger(name)))
    const failed = fields.filter((_, index) => !results[index])
    if (failed.length) {
      form.focusFirstOf(failed)
      return
    }
    goToStep(currentStep + 1, 'forward')
  }

  function handleBack() {
    if (currentStep === 0) return
    goToStep(currentStep - 1, 'back')
  }

  function handleApiError(error: unknown) {
    const match = resolveConflictField(error, CONFLICT_FIELD_MAP)
    if (match) {
      setError(match.field, { message: match.message })
      const step = FIELD_TO_STEP[match.field]
      if (step !== undefined && step !== currentStep) goToStep(step, 'back')
      return
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
        preferredSubcategories: values.preferredSubcategories,
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
            <FormSubmitButton
              control={control}
              required={STEP_REQUIRED[currentStep]}
              label={isPending ? 'Salvando...' : 'Concluir'}
              onPress={handleSubmit(onSubmit, form.focusFirstError)}
              loading={isPending}
              disabled={rolesBlocked}
            />
          ) : (
            <FormSubmitButton
              control={control}
              required={STEP_REQUIRED[currentStep]}
              label="Continuar"
              onPress={handleNext}
            />
          )}
        </View>
      </View>
    </View>
  )
}
