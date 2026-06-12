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

      <View className="flex-1 bg-black">
        {/* Header — respeita safe area no topo */}
        <View
          style={{ paddingTop: insets.top + 16 }}
          className="px-5 pb-4 border-b border-zinc-800"
        >
          <Text className="text-2xl font-bold text-white">Sua privacidade</Text>
          <Text className="text-zinc-400 text-sm mt-1 leading-5">
            Escolha o que nos permite usar. Você pode mudar isso a qualquer
            momento em{' '}
            <Text className="text-violet-400 font-medium">
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
          <View className="mx-4 mt-4 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-zinc-800">
              <View className="flex-row items-center gap-2">
                <Ionicons name="lock-closed" size={14} color="#a78bfa" />
                <Text className="text-sm font-semibold text-violet-400">
                  Dados essenciais
                </Text>
              </View>
              <Text className="text-xs text-zinc-500">Sempre ativo</Text>
            </View>
            <View className="px-4 py-3">
              <Text className="text-xs text-zinc-400 leading-4">
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
                className="mx-4 mt-3 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden"
              >
                <Pressable
                  onPress={() => setExpandedCategory(expanded ? null : cat)}
                  className="flex-row items-center justify-between px-4 py-3 active:opacity-70"
                >
                  <Text className="text-sm font-semibold text-white">
                    {CATEGORY_LABELS[cat]}
                  </Text>
                  <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#71717a"
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
            <Ionicons name="document-text-outline" size={14} color="#7c3aed" />
            <Text className="text-violet-400 text-sm">
              Ler a Política de Privacidade completa
            </Text>
          </Pressable>

          <Text className="text-zinc-600 text-xs text-center mt-3 mx-6 leading-4">
            LGPD — Lei nº 13.709/2018. Consentimento livre, informado e
            inequívoco (Art. 8).{'\n'}
            Versão da política: 1.0 · Vigência: 02/06/2026.
          </Text>
        </ScrollView>

        {/* Botões fixos — respeita safe area no rodapé (home bar iPhone) */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-black border-t border-zinc-800 px-4 gap-2"
          style={{ paddingBottom: insets.bottom + 8, paddingTop: 12 }}
        >
          <Pressable
            onPress={handleAcceptAll}
            disabled={loading}
            className="bg-violet-600 rounded-xl py-4 items-center active:opacity-80"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                Aceitar todos
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => handleSubmit()}
            disabled={loading}
            className="bg-zinc-900 rounded-xl py-4 items-center border border-zinc-700 active:opacity-80"
          >
            <Text
              className={`font-semibold text-base ${loading ? 'text-zinc-500' : 'text-white'}`}
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
              className={`text-sm ${loading ? 'text-zinc-700' : 'text-zinc-500'}`}
            >
              Apenas o essencial
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  )
}
