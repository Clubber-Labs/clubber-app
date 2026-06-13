import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { CompleteProfileForm } from '@/features/auth/components/CompleteProfileForm'
import { Button } from '@/shared/components/Button'
import { useConfirm } from '@/shared/lib/confirm'
import { colors } from '@/shared/theme'

export default function CompleteProfileScreen() {
  const { data: profile, isLoading, isError, refetch } = useMyProfile()
  const logout = useLogout()
  const confirm = useConfirm()

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <Pressable
          onPress={handleExit}
          hitSlop={12}
          className="flex-row items-center gap-1 px-6 pt-4 self-start"
        >
          <Ionicons name="chevron-back" size={22} color={colors.content} />
          <Text className="text-content font-semibold text-base">Sair</Text>
        </Pressable>

        <ScrollView
          contentContainerStyle={{ padding: 24, paddingTop: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-3xl font-bold text-content mb-2">
            Complete seu perfil
          </Text>
          <Text className="text-content-muted mb-8">
            Faltam algumas informações pra você começar a usar o ConnectAI.
          </Text>

          {isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator color={colors.brandText} />
            </View>
          ) : isError || !profile ? (
            <View className="items-center py-12 gap-4">
              <Text className="text-content text-base text-center">
                Não conseguimos carregar seu perfil. Verifique sua conexão.
              </Text>
              <Button
                label="Tentar novamente"
                onPress={() => refetch()}
                variant="secondary"
              />
            </View>
          ) : (
            <CompleteProfileForm profile={profile} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}
