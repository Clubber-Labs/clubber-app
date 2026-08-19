import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { RadioButtonIcon } from 'phosphor-react-native'
import { FormError } from '@/shared/components/FormError'
import { getApiError } from '@/shared/lib/apiError'
import {
  LANGUAGE_ENDONYMS,
  SUPPORTED_LOCALES,
  type Locale,
} from '@/shared/i18n'
import { useLocalePreference } from '@/features/users/hooks/useLocalePreference'
import { colors } from '@/shared/theme'

export default function LanguageSettingsScreen() {
  const { t } = useTranslation()
  const { current, select, saving, ready } = useLocalePreference()
  const [error, setError] = useState<string | null>(null)

  // O hook é otimista e RE-LANÇA em erro (já tendo revertido o idioma) — aqui só
  // mostramos por que a escolha não pegou.
  function handleSelect(locale: Locale) {
    setError(null)
    select(locale).catch(e => setError(getApiError(e).message))
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4 pt-6 pb-4 border-b border-line">
        <Text className="text-xl font-bold text-content">
          {t('settings.language')}
        </Text>
        <Text className="text-xs text-content-subtle mt-1">
          {t('settings.languageScreen.subtitle')}
        </Text>
      </View>

      <View className="mx-4 mt-4 bg-surface-sunken border border-line rounded-xl px-4">
        {SUPPORTED_LOCALES.map((locale, index) => {
          const active = current === locale
          return (
            <Pressable
              key={locale}
              onPress={() => handleSelect(locale)}
              disabled={!ready || saving}
              accessibilityRole="button"
              accessibilityState={{
                selected: active,
                disabled: !ready || saving,
              }}
              // Só o perfil ausente apaga a lista: durante o PUT o toque é
              // bloqueado sem mudar de cor, senão a troca (que é instantânea na
              // interface) piscaria a cada escolha.
              className={`flex-row items-center justify-between py-4 ${
                index > 0 ? 'border-t border-line' : ''
              } ${ready ? '' : 'opacity-50'}`}
            >
              <Text className="text-content-bright text-base">
                {LANGUAGE_ENDONYMS[locale]}
              </Text>
              <RadioButtonIcon
                size={20}
                color={active ? colors.brandEmphasis : colors.contentFaint}
                weight={active ? 'fill' : 'regular'}
              />
            </Pressable>
          )
        })}
      </View>

      <View className="mx-4 mt-3">
        <FormError message={error} />
      </View>
    </ScrollView>
  )
}
