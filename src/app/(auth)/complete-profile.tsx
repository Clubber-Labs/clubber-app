import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native'
import { Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import { useCompleteProfile } from '@/features/auth/hooks/useCompleteProfile'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { CompleteProfileForm } from '@/features/auth/components/CompleteProfileForm'
import { Button } from '@/shared/components/Button'
import { useBanner } from '@/shared/lib/banner'
import { useConfirm } from '@/shared/lib/confirm'
import { getConflictMessage } from '@/shared/utils/conflictMessage'
import { toLocalIsoDate } from '@/shared/utils/dateFormat'
import type { CompleteProfileInput } from '@/features/auth/schemas/completeProfileSchema'

export default function CompleteProfileScreen() {
  const { data: profile, isLoading, isError, refetch } = useMyProfile()
  const { mutate: complete, isPending } = useCompleteProfile(profile?.id ?? '')
  const logout = useLogout()
  const confirm = useConfirm()
  const showBanner = useBanner()

  function handleSubmit(values: CompleteProfileInput) {
    const payload = {
      name: values.name,
      lastname: values.lastname,
      username: values.username,
      phone: values.phone,
      bio: values.bio,
      isPrivate: values.isPrivate,
      birthdate: toLocalIsoDate(values.birthdate),
    }
    complete(payload, {
      onError: error => {
        const conflictMessage = getConflictMessage(error)
        showBanner(
          conflictMessage ??
            'Não foi possível salvar suas informações. Verifique sua conexão e tente de novo.',
        )
      },
    })
  }

  async function handleExit() {
    const ok = await confirm({
      title: 'Sair e voltar pro login',
      message:
        'Suas informações não serão salvas. Você precisará entrar novamente pra completar o perfil.',
      confirmLabel: 'Voltar',
      cancelLabel: 'Continuar',
      destructive: true,
    })
    if (ok) await logout()
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View className="flex-1 bg-black">
        <Pressable
          onPress={handleExit}
          hitSlop={12}
          className="flex-row items-center gap-1 px-6 pt-4 self-start"
        >
          <Ionicons name="chevron-back" size={22} color="#ffffff" />
          <Text className="text-white font-semibold text-base">Sair</Text>
        </Pressable>

        <ScrollView
          contentContainerStyle={{ padding: 24, paddingTop: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-3xl font-bold text-white mb-2">
            Complete seu perfil
          </Text>
          <Text className="text-zinc-400 mb-8">
            Faltam algumas informações pra você começar a usar o ConnectAI.
          </Text>

          {isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#a78bfa" />
            </View>
          ) : isError || !profile ? (
            <View className="items-center py-12 gap-4">
              <Text className="text-white text-base text-center">
                Não conseguimos carregar seu perfil. Verifique sua conexão.
              </Text>
              <Button
                label="Tentar novamente"
                onPress={() => refetch()}
                variant="secondary"
              />
            </View>
          ) : (
            <CompleteProfileForm
              profile={profile}
              saving={isPending}
              onSubmit={handleSubmit}
            />
          )}
        </ScrollView>
      </View>
    </>
  )
}
