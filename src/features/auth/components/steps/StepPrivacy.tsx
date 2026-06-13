import { useMemo } from 'react'
import { Linking, Pressable, Switch, Text, View } from 'react-native'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import { Ionicons } from '@expo/vector-icons'
import type { RegisterInput } from '../../schemas/registerSchema'
import { ConsentToggleRow } from '@/features/privacy/components/ConsentToggleRow'
import {
  CATEGORY_LABELS,
  CONSENT_VERSION,
} from '@/features/privacy/services/consentService'
import {
  ORDERED_CATEGORIES,
  groupItemsByCategory,
} from '@/features/privacy/constants'
import { colors } from '@/shared/theme'

type Props = {
  control: Control<RegisterInput>
  errors: FieldErrors<RegisterInput>
}

export function StepPrivacy({ control, errors }: Props) {
  const itemsByCategory = useMemo(() => groupItemsByCategory(), [])

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-content">
          Privacidade e LGPD
        </Text>
        <Text className="text-sm text-content-muted">
          Confirme os termos obrigatórios e escolha os usos opcionais dos seus
          dados.
        </Text>
      </View>

      <View className="bg-surface-sunken border border-line rounded-xl overflow-hidden">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-line">
          <View className="flex-row items-center gap-2 flex-1">
            <Ionicons name="lock-closed" size={14} color={colors.brandText} />
            <Text className="text-sm font-semibold text-brand-text">
              Dados essenciais
            </Text>
          </View>
          <Text className="text-[10px] font-bold uppercase text-brand-text-strong">
            Obrigatório
          </Text>
        </View>

        <View className="flex-row items-start px-4 py-4">
          <View className="flex-1 mr-4 gap-1">
            <Text className="text-sm font-semibold text-content">
              Termos de Uso e Política de Privacidade
            </Text>
            <Text className="text-xs text-content-muted leading-4">
              Necessário para criar e manter sua conta, autenticação e operação
              básica do app.
            </Text>
          </View>
          <Controller
            control={control}
            name="termsAccepted"
            render={({ field: { onChange, value } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
                thumbColor={value ? colors.brand : colors.lineStrong}
                trackColor={{
                  true: colors.brandSurfaceStrong,
                  false: colors.line,
                }}
                ios_backgroundColor={colors.line}
              />
            )}
          />
        </View>

        {errors.termsAccepted && (
          <Text className="px-4 pb-4 text-content text-xs">
            {errors.termsAccepted.message}
          </Text>
        )}
      </View>

      {ORDERED_CATEGORIES.map(cat => {
        const items = itemsByCategory[cat]
        if (!items?.length) return null

        return (
          <View
            key={cat}
            className="bg-surface-sunken border border-line rounded-xl overflow-hidden"
          >
            <View className="px-4 py-3 border-b border-line">
              <Text className="text-sm font-semibold text-content-tertiary">
                {CATEGORY_LABELS[cat]}
              </Text>
            </View>

            {items.map((item, idx) => (
              <Controller
                key={item.key}
                control={control}
                name={`consents.${item.key}`}
                render={({ field: { onChange, value } }) => (
                  <ConsentToggleRow
                    label={item.label}
                    description={item.description}
                    value={value}
                    onChange={onChange}
                    isLast={idx === items.length - 1}
                  />
                )}
              />
            ))}
          </View>
        )
      })}

      <Pressable
        onPress={() => Linking.openURL('https://connectai.app/privacidade')}
        className="flex-row items-center justify-center gap-2 active:opacity-70"
      >
        <Ionicons name="document-text-outline" size={14} color={colors.brand} />
        <Text className="text-brand-text text-sm">
          Ler a Política de Privacidade completa
        </Text>
      </Pressable>

      <Text className="text-content-faint text-xs text-center leading-4">
        LGPD - Lei no 13.709/2018. Consentimento livre, informado e inequivoco
        (Art. 8).
        {'\n'}Versao da politica: {CONSENT_VERSION} - Vigencia: 02/06/2026.
      </Text>
    </View>
  )
}
