import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useMyProfile, useUpdateProfile } from './useProfile'
import { getApiError } from '@/shared/lib/apiError'
import type { UpdateMePayload } from '../services/usersService'

// Orquestra o salvar de uma tela focada de um campo só: pega o perfil (cache
// quente vindo do hub), aplica o PATCH parcial e volta. O erro vira sinal inline
// na própria tela — o 409 de username em uso chega como USERNAME_TAKEN, que o
// getApiError já traduz.
export function useEditProfileField() {
  const router = useRouter()
  const { data: profile } = useMyProfile()
  const update = useUpdateProfile(profile?.id ?? '')
  const [error, setError] = useState<string | null>(null)

  function save(patch: UpdateMePayload) {
    setError(null)
    update.mutate(patch, {
      onSuccess: () => router.back(),
      onError: err => setError(getApiError(err).message),
    })
  }

  return { profile, save, saving: update.isPending, error }
}
