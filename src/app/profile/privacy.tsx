import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native'
import { Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { ConsentToggleRow } from '@/features/privacy/components/ConsentToggleRow'
import { useConsent } from '@/features/privacy/hooks/useConsent'
import {
  CATEGORY_LABELS,
  CONSENT_VERSION,
  type ConsentFields,
} from '@/features/privacy/services/consentService'
import {
  ORDERED_CATEGORIES,
  groupItemsByCategory,
} from '@/features/privacy/constants'
import { useConfirm } from '@/shared/lib/confirm'
import { colors } from '@/shared/theme'

export default function PrivacyScreen() {
  const {
    consent,
    updateConsent,
    revokeAll,
    exportData,
    auditLog,
    isSynced,
    needsVersionBump,
  } = useConsent()
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const confirm = useConfirm()

  const itemsByCategory = useMemo(() => groupItemsByCategory(), [])

  const fieldValues: ConsentFields = {
    locationPrecise: consent.locationPrecise,
    socialFeed: consent.socialFeed,
    socialVisibility: consent.socialVisibility,
    pushNotifications: consent.pushNotifications,
    marketing: consent.marketing,
    analytics: consent.analytics,
    surveys: consent.surveys,
  }

  async function handleToggle(key: keyof ConsentFields, value: boolean) {
    await updateConsent({ [key]: value })
  }

  async function handleRevokeAll() {
    const ok = await confirm({
      title: 'Revogar todos os consentimentos',
      message:
        'Isso desativa todas as funcionalidades opcionais. Você pode reativar a qualquer momento.',
      confirmLabel: 'Revogar tudo',
      destructive: true,
    })
    if (ok) revokeAll()
  }

  async function handleExport() {
    setExporting(true)
    setExportError(null)
    try {
      const data = await exportData()
      await Share.share({
        title: 'Meus dados LGPD — ConnectAI',
        message: JSON.stringify(data, null, 2),
      })
    } catch {
      setExportError('Não foi possível exportar seus dados. Tente novamente.')
    } finally {
      setExporting(false)
    }
  }

  async function handleAuditLog() {
    try {
      const data = await auditLog()
      await Share.share({
        title: 'Histórico de consentimentos — ConnectAI',
        message: JSON.stringify(data, null, 2),
      })
    } catch {
      // silent — falha no log de auditoria não bloqueia o usuário
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 pt-6 pb-4 border-b border-line">
          <Text className="text-xl font-bold text-content">Privacidade</Text>
          <Text className="text-content-muted text-sm mt-1">
            Controle como o ConnectAI usa seus dados — LGPD nº 13.709/2018.
          </Text>

          {!isSynced && (
            <View className="flex-row items-center gap-2 mt-2">
              <ActivityIndicator size="small" color={colors.brandText} />
              <Text className="text-brand-text text-xs">
                Salvando preferências…
              </Text>
            </View>
          )}

          {needsVersionBump && (
            <View className="mt-2 bg-warning-surface-strong border border-warning rounded-lg px-3 py-2">
              <Text className="text-warning text-xs">
                ⚠️ Nossa Política de Privacidade foi atualizada para a v
                {CONSENT_VERSION}. Revise suas preferências abaixo.
              </Text>
            </View>
          )}
        </View>

        {/* Essencial — sempre ativo */}
        <View className="mx-4 mt-4 bg-surface-sunken border border-line rounded-xl overflow-hidden">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-line">
            <View className="flex-row items-center gap-2">
              <Ionicons name="lock-closed" size={14} color={colors.brandText} />
              <Text className="text-sm font-semibold text-brand-text">
                Dados essenciais
              </Text>
            </View>
            <Text className="text-xs text-content-subtle">Sempre ativo</Text>
          </View>
          <View className="px-4 py-3">
            <Text className="text-xs text-content-muted leading-4">
              Necessários para autenticação, operação da conta e moderação de
              segurança. Não podem ser desativados.
            </Text>
          </View>
        </View>

        {/* Seções configuráveis */}
        {ORDERED_CATEGORIES.map(cat => {
          const items = itemsByCategory[cat]
          if (!items?.length) return null

          return (
            <View
              key={cat}
              className="mx-4 mt-3 bg-surface-sunken border border-line rounded-xl overflow-hidden"
            >
              <View className="px-4 py-3 border-b border-line">
                <Text className="text-sm font-semibold text-content-tertiary">
                  {CATEGORY_LABELS[cat]}
                </Text>
              </View>
              {items.map((item, idx) => (
                <ConsentToggleRow
                  key={item.key}
                  label={item.label}
                  description={item.description}
                  value={fieldValues[item.key]}
                  onChange={v => handleToggle(item.key, v)}
                  isLast={idx === items.length - 1}
                />
              ))}
            </View>
          )
        })}

        {/* Direitos LGPD */}
        <View className="mx-4 mt-5 bg-surface-sunken border border-line rounded-xl overflow-hidden">
          <View className="px-4 py-3 border-b border-line">
            <Text className="text-sm font-semibold text-content-tertiary">
              ⚖️ Direitos LGPD (Art. 18)
            </Text>
          </View>

          <Pressable
            onPress={() => Linking.openURL('https://connectai.app/privacidade')}
            className="flex-row items-center justify-between px-4 py-4 border-b border-line active:opacity-70"
          >
            <View className="flex-1">
              <Text className="text-sm font-medium text-content">
                Política de Privacidade
              </Text>
              <Text className="text-xs text-content-subtle mt-0.5">
                Versão {consent.consentVersion ?? CONSENT_VERSION} · Vigência:
                02/06/2026
              </Text>
            </View>
            <Ionicons
              name="open-outline"
              size={16}
              color={colors.contentSubtle}
            />
          </Pressable>

          <Pressable
            onPress={handleExport}
            disabled={exporting}
            className="flex-row items-center justify-between px-4 py-4 border-b border-line active:opacity-70"
          >
            <View className="flex-1">
              <Text className="text-sm font-medium text-content">
                Exportar meus dados
              </Text>
              <Text className="text-xs text-content-subtle mt-0.5">
                Receba seu histórico de consentimentos (Art. 18, V)
              </Text>
              {exportError && (
                <Text className="text-danger text-xs mt-1">{exportError}</Text>
              )}
            </View>
            {exporting ? (
              <ActivityIndicator size="small" color={colors.brandText} />
            ) : (
              <Ionicons
                name="download-outline"
                size={16}
                color={colors.contentSubtle}
              />
            )}
          </Pressable>

          <Pressable
            onPress={handleAuditLog}
            className="flex-row items-center justify-between px-4 py-4 border-b border-line active:opacity-70"
          >
            <View className="flex-1">
              <Text className="text-sm font-medium text-content">
                Ver histórico de consentimentos
              </Text>
              <Text className="text-xs text-content-subtle mt-0.5">
                Registro de alterações de privacidade (Art. 18, I)
              </Text>
            </View>
            <Ionicons
              name="time-outline"
              size={16}
              color={colors.contentSubtle}
            />
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL('mailto:privacidade@connectai.app')}
            className="flex-row items-center justify-between px-4 py-4 border-b border-line active:opacity-70"
          >
            <View className="flex-1">
              <Text className="text-sm font-medium text-content">
                Falar com a equipe de privacidade
              </Text>
              <Text className="text-xs text-content-subtle mt-0.5">
                privacidade@connectai.app
              </Text>
            </View>
            <Ionicons
              name="mail-outline"
              size={16}
              color={colors.contentSubtle}
            />
          </Pressable>

          <Pressable
            onPress={handleRevokeAll}
            className="px-4 py-4 active:opacity-70"
          >
            <Text className="text-sm font-medium text-danger-text">
              Revogar todos os consentimentos
            </Text>
            <Text className="text-xs text-content-subtle mt-0.5">
              Desativa todas as funcionalidades opcionais (Art. 8, §5)
            </Text>
          </Pressable>
        </View>

        <Text className="text-content-faint text-xs text-center mt-5 mx-8 leading-4">
          Alterações salvas automaticamente. Prazo de resposta: até 15 dias
          úteis.
        </Text>
      </ScrollView>
    </>
  )
}
