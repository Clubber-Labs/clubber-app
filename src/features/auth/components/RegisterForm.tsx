import { useRef, useState } from 'react'
import {
  View,
  Text,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '../schemas/registerSchema'
import { useRegister } from '../hooks/useRegister'
import { Button } from '@/shared/components/Button'
import { RegisterProgressBar } from './RegisterProgressBar'
import { StepPersonal } from './steps/StepPersonal'
import { StepAccount } from './steps/StepAccount'
import { StepPassword } from './steps/StepPassword'
import { StepProfile } from './steps/StepProfile'
import { getApiError, isConflictError } from '@/shared/lib/apiError'

const STEPS: (keyof RegisterInput)[][] = [
  ['name', 'lastname', 'birthdate'],
  ['username', 'email', 'phone'],
  ['password', 'confirmPassword'],
  ['bio', 'isPrivate'],
]

const FIELD_TO_STEP: Partial<Record<keyof RegisterInput, number>> = {
  name: 0,
  lastname: 0,
  birthdate: 0,
  username: 1,
  email: 1,
  phone: 1,
  password: 2,
  confirmPassword: 2,
  bio: 3,
  isPrivate: 3,
}

const CONFLICT_FIELD_MAP: {
  keyword: string
  field: keyof RegisterInput
  message: string
}[] = [
  { keyword: 'telefone', field: 'phone', message: 'Telefone já cadastrado.' },
  { keyword: 'phone', field: 'phone', message: 'Telefone já cadastrado.' },
  { keyword: 'email', field: 'email', message: 'E-mail já cadastrado.' },
  {
    keyword: 'username',
    field: 'username',
    message: 'Username já está em uso.',
  },
]

function getConflictField(
  error: unknown,
): { field: keyof RegisterInput; message: string } | null {
  if (!isConflictError(error)) return null
  const { message } = getApiError(error)
  const lower = message.toLowerCase()
  return (
    CONFLICT_FIELD_MAP.find(({ keyword }) => lower.includes(keyword)) ?? null
  )
}

export function RegisterForm() {
  const { mutate: register, isPending } = useRegister()
  const [currentStep, setCurrentStep] = useState(0)
  const [genericError, setGenericError] = useState<string | null>(null)
  const progress = useRef(new Animated.Value(1 / STEPS.length)).current
  const slideAnim = useRef(new Animated.Value(0)).current

  const {
    control,
    handleSubmit,
    trigger,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: { isPrivate: false },
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
    setGenericError(null)
    const fieldError = getConflictField(error)
    if (fieldError) {
      setError(fieldError.field, { message: fieldError.message })
      const targetStep = FIELD_TO_STEP[fieldError.field as keyof RegisterInput]
      if (targetStep !== undefined && targetStep !== currentStep)
        goToStep(targetStep, 'back')
    } else {
      setGenericError(getApiError(error).message)
    }
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          <View className="bg-zinc-900 border border-white rounded-xl px-4 py-3">
            <Text className="text-white text-sm">{genericError}</Text>
          </View>
        )}

        <View className="flex-row gap-3">
          {currentStep > 0 && (
            <View className="flex-1">
              <Button label="Voltar" onPress={handleBack} variant="secondary" />
            </View>
          )}
          <View className="flex-1">
            {isLastStep ? (
              <Button
                label={isPending ? 'Criando conta...' : 'Criar conta'}
                onPress={handleSubmit(data => {
                  setGenericError(null)
                  register(data, { onError: handleApiError })
                })}
                loading={isPending}
              />
            ) : (
              <Button label="Continuar" onPress={handleNext} />
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
