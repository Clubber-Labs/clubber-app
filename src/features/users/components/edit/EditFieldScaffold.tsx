import type { ReactNode } from 'react'
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { CaretLeftIcon } from 'phosphor-react-native'
import { useRouter } from 'expo-router'
import { colors } from '@/shared/theme'

type Props = {
  title: string
  onSave: () => void
  saving: boolean
  canSave: boolean
  children: ReactNode
}

// Casca compartilhada das telas focadas de edição: header próprio (voltar +
// título + Salvar) e área de conteúdo. Sem header global — cada tela é
// autossuficiente. O Salvar fica desabilitado até haver uma mudança válida.
export function EditFieldScaffold({
  title,
  onSave,
  saving,
  canSave,
  children,
}: Props) {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View className="flex-row items-center gap-3 px-3 pt-2 pb-3">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-surface-elevated items-center justify-center"
          accessibilityLabel={t('common.back')}
        >
          <CaretLeftIcon size={22} color={colors.contentSecondary} />
        </Pressable>
        <Text className="flex-1 text-content text-lg font-extrabold">
          {title}
        </Text>
        <Pressable
          onPress={onSave}
          disabled={!canSave || saving}
          hitSlop={8}
          className="px-2 py-1"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave || saving }}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.brandText} />
          ) : (
            <Text
              className={`text-[15px] font-bold ${
                canSave ? 'text-brand-text' : 'text-content-faint'
              }`}
            >
              {t('common.save')}
            </Text>
          )}
        </Pressable>
      </View>

      <View className="flex-1 px-4 pt-3">{children}</View>
    </KeyboardAvoidingView>
  )
}
