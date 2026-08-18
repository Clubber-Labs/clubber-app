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
import { useTranslation } from 'react-i18next'
import { CaretLeftIcon } from 'phosphor-react-native'
import { useMyProfile } from '@/features/users/hooks/useProfile'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { CompleteProfileForm } from '@/features/auth/components/CompleteProfileForm'
import { Button } from '@/shared/components/Button'
import { useConfirm } from '@/shared/lib/confirm'
import { FormFocusProvider } from '@/shared/lib/formFocus'
import { useKeyboardAwareForm } from '@/shared/hooks/useKeyboardAwareForm'
import { colors } from '@/shared/theme'

export default function CompleteProfileScreen() {
  const { t } = useTranslation()
  const { data: profile, isLoading, isError, refetch } = useMyProfile()
  const logout = useLogout()
  const confirm = useConfirm()
  const form = useKeyboardAwareForm()

  async function handleExit() {
    const ok = await confirm({
      title: t('auth.completeProfile.exitTitle'),
      message: t('auth.completeProfile.exitMessage'),
      confirmLabel: t('common.back'),
      cancelLabel: t('common.continue'),
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
          <CaretLeftIcon size={22} color={colors.content} />
          <Text className="text-content font-semibold text-base">
            {t('auth.completeProfile.exit')}
          </Text>
        </Pressable>

        <ScrollView
          {...form.scrollProps}
          contentContainerStyle={{ padding: 24, paddingTop: 16 }}
        >
          <Text className="text-3xl font-bold text-content mb-2">
            {t('auth.completeProfile.title')}
          </Text>
          <Text className="text-content-muted mb-8">
            {t('auth.completeProfile.subtitle')}
          </Text>

          {isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator color={colors.brandText} />
            </View>
          ) : isError || !profile ? (
            <View className="items-center py-12 gap-4">
              <Text className="text-content text-base text-center">
                {t('auth.completeProfile.loadError')}
              </Text>
              <Button
                label={t('common.retry')}
                onPress={() => refetch()}
                variant="secondary"
              />
            </View>
          ) : (
            <FormFocusProvider value={form}>
              <CompleteProfileForm profile={profile} />
            </FormFocusProvider>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}
