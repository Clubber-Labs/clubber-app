import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { ConsentToggleRow } from '@/features/privacy/components/ConsentToggleRow'
import { useConsent } from '@/features/privacy/hooks/useConsent'
import {
  CATEGORY_LABELS,
  type ConsentFields,
} from '@/features/privacy/services/consentService'
import {
  DEFAULT_CONSENT_FIELDS,
  ORDERED_CATEGORIES,
  groupItemsByCategory,
} from '@/features/privacy/constants'
import { colors } from '@/shared/theme'

export default function ConsentScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { grantConsent } = useConsent()

  const [fields, setFields] = useState<ConsentFields>(DEFAULT_CONSENT_FIELDS)
  const [loading, setLoading] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    'location',
  )

  const itemsByCategory = useMemo(() => groupItemsByCategory(), [])

  function toggleField(key: keyof ConsentFields, value: boolean) {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(override?: ConsentFields) {
    if (loading) return
    setLoading(true)
    try {
      await grantConsent(override ?? fields)
      router.replace('/(tabs)/feed')
    } finally {
      setLoading(false)
    }
  }

  function handleAcceptAll() {
    const all = Object.fromEntries(
      Object.keys(DEFAULT_CONSENT_FIELDS).map(k => [k, true]),
    ) as ConsentFields
    handleSubmit(all)
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />

      <View className="flex-1 bg-background">
        {/* Header — respeita safe area no topo */}
        <View
          style={{ paddingTop: insets.top + 16 }}
          className="px-5 pb-4 border-b border-line"
        >
          <Text className="text-2xl font-bold text-content">
            Sua privacidade
          </Text>
          <Text className="text-content-muted text-sm mt-1 leading-5">
            Escolha o que nos permite usar. Você pode mudar isso a qualquer
            momento em{' '}
            <Text className="text-brand-text font-medium">
              Perfil → Privacidade
            </Text>
            .
          </Text>
        </View>

        {/* Conteúdo scrollável — padding-bottom garante espaço para os botões fixos */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 180 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Essencial — imutável */}
          <View className="mx-4 mt-4 bg-surface-sunken border border-line rounded-xl overflow-hidden">
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-line">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="lock-closed"
                  size={14}
                  color={colors.brandText}
                />
                <Text className="text-sm font-semibold text-brand-text">
                  Dados essenciais
                </Text>
              </View>
              <Text className="text-xs text-content-subtle">Sempre ativo</Text>
            </View>
            <View className="px-4 py-3">
              <Text className="text-xs text-content-muted leading-4">
                Necessários para criar e manter sua conta, autenticação e
                operação básica do app. Não podem ser desativados.
              </Text>
            </View>
          </View>

          {/* Consentimentos granulares */}
          {ORDERED_CATEGORIES.map(cat => {
            const items = itemsByCategory[cat]
            if (!items?.length) return null
            const expanded = expandedCategory === cat

            return (
              <View
                key={cat}
                className="mx-4 mt-3 bg-surface-sunken border border-line rounded-xl overflow-hidden"
              >
                <Pressable
                  onPress={() => setExpandedCategory(expanded ? null : cat)}
                  className="flex-row items-center justify-between px-4 py-3 active:opacity-70"
                >
                  <Text className="text-sm font-semibold text-content">
                    {CATEGORY_LABELS[cat]}
                  </Text>
                  <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.contentSubtle}
                  />
                </Pressable>

                {expanded &&
                  items.map((item, idx) => (
                    <ConsentToggleRow
                      key={item.key}
                      label={item.label}
                      description={item.description}
                      value={fields[item.key]}
                      onChange={v => toggleField(item.key, v)}
                      isLast={idx === items.length - 1}
                    />
                  ))}
              </View>
            )
          })}

          {/* Link para a política */}
          <Pressable
            onPress={() => Linking.openURL('https://connectai.app/privacidade')}
            className="flex-row items-center justify-center gap-2 mt-5 mx-4 active:opacity-70"
          >
            <Ionicons
              name="document-text-outline"
              size={14}
              color={colors.brand}
            />
            <Text className="text-brand-text text-sm">
              Ler a Política de Privacidade completa
            </Text>
          </Pressable>

          <Text className="text-content-faint text-xs text-center mt-3 mx-6 leading-4">
            LGPD — Lei nº 13.709/2018. Consentimento livre, informado e
            inequívoco (Art. 8).{'\n'}
            Versão da política: 1.0 · Vigência: 02/06/2026.
          </Text>
        </ScrollView>

        {/* Botões fixos — respeita safe area no rodapé (home bar iPhone) */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-background border-t border-line px-4 gap-2"
          style={{ paddingBottom: insets.bottom + 8, paddingTop: 12 }}
        >
          <Pressable
            onPress={handleAcceptAll}
            disabled={loading}
            className="bg-brand rounded-xl py-4 items-center active:opacity-80"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-content font-bold text-base">
                Aceitar todos
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => handleSubmit()}
            disabled={loading}
            className="bg-surface rounded-xl py-4 items-center border border-line-strong active:opacity-80"
          >
            <Text
              className={`font-semibold text-base ${loading ? 'text-content-subtle' : 'text-content'}`}
            >
              Continuar com selecionados
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleSubmit(DEFAULT_CONSENT_FIELDS)}
            disabled={loading}
            className="py-3 items-center"
          >
            <Text
              className={`text-sm ${loading ? 'text-content-faint' : 'text-content-subtle'}`}
            >
              Apenas o essencial
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  )
}
