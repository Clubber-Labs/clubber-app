import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import {
  saveToken,
  saveRefreshToken,
  saveUserId,
  clearAuthSession,
} from '@/shared/lib/secureStore'
import type { RegisterInput, RegisterPayload } from '../schemas/registerSchema'
import {
  consentService,
  CONSENT_VERSION,
  type ConsentFields,
} from '@/features/privacy/services/consentService'
import { useConsentStore } from '@/features/privacy/store/consentStore'

function toPayload(data: RegisterInput): RegisterPayload {
  return {
    name: data.name,
    lastname: data.lastname,
    username: data.username,
    phone: data.phone,
    email: data.email,
    password: data.password,
    birthdate: data.birthdate.toISOString(),
    bio: data.bio,
    isPrivate: data.isPrivate,
    // Campo opcional: só envia quando há seleção (vazio → omite).
    ...(data.preferredCategories?.length
      ? { preferredCategories: data.preferredCategories }
      : {}),
  }
}

async function saveRegistrationConsent(consents: ConsentFields) {
  try {
    await consentService.create(consents)
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 409) {
      await consentService.update(consents)
    } else {
      throw error
    }
  }

  const consentStore = useConsentStore.getState()
  consentStore.hydrate({
    ...consents,
    consentGiven: true,
    consentVersion: CONSENT_VERSION,
    revokedAt: null,
  })
  consentStore.markSynced()
}

export function useRegister() {
  const setUser = useAuthStore(s => s.setUser)

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      await authService.register(toPayload(data))
      const response = await authService.login({
        email: data.email,
        password: data.password,
      })
      const token = response.token
      await saveToken(token)
      await saveRefreshToken(response.refreshToken)

      try {
        const userId = response.userId ?? (await authService.me()).id
        await saveRegistrationConsent(data.consents)
        await saveUserId(userId)
        return { token, userId }
      } catch (err) {
        await clearAuthSession()
        throw err
      }
    },
    onSuccess: ({ userId }) => {
      setUser(userId)
    },
  })
}
