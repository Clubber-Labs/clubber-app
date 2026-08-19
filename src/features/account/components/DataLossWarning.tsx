import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  XCircleIcon,
  InfoIcon,
  DownloadSimpleIcon,
  ArrowSquareOutIcon,
} from 'phosphor-react-native'
import { Button } from '@/shared/components/Button'
import { openDocument } from '@/shared/lib/openDocument'
import { colors } from '@/shared/theme'

type Props = {
  onExport: () => void
  exporting: boolean
  exportError: string | null
  onContinue: () => void
  onBack: () => void
}

// Chaves, não frases: a constante avalia no import e congelaria o idioma.
const LOST_ITEM_KEYS = [
  'account.dataLoss.0',
  'account.dataLoss.1',
  'account.dataLoss.2',
] as const

export function DataLossWarning({
  onExport,
  exporting,
  exportError,
  onContinue,
  onBack,
}: Props) {
  const { t } = useTranslation()
  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-content text-xl font-bold">
          {t('account.deleteIntro.title')}
        </Text>
        <Text className="text-content-muted text-sm leading-5">
          {t('account.deleteIntro.body')}
        </Text>
      </View>

      <View className="bg-surface-sunken border border-line rounded-xl p-4 gap-3">
        <Text className="text-content-tertiary text-sm font-semibold">
          {t('account.dataLoss.title')}
        </Text>
        {LOST_ITEM_KEYS.map(key => (
          <View key={key} className="flex-row items-start gap-2">
            <XCircleIcon size={16} color={colors.danger} weight="fill" />
            <Text className="text-content-tertiary text-sm flex-1">
              {t(key)}
            </Text>
          </View>
        ))}
        <View className="flex-row items-start gap-2 pt-1 border-t border-line mt-1">
          <InfoIcon size={16} color={colors.contentMuted} weight="fill" />
          <Text className="text-content-muted text-xs flex-1 leading-4">
            {t('account.dataLoss.anonymized')}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onExport}
        disabled={exporting}
        className="flex-row items-center justify-between bg-surface-sunken border border-line rounded-xl px-4 py-4 active:opacity-70"
      >
        <View className="flex-1 pr-3">
          <Text className="text-sm font-medium text-content">
            {t('account.dataLoss.export')}
          </Text>
          <Text className="text-xs text-content-subtle mt-0.5 leading-4">
            {t('account.dataLoss.exportHint')}
          </Text>
          {exportError && (
            <Text className="text-danger text-xs mt-1">{exportError}</Text>
          )}
        </View>
        {exporting ? (
          <ActivityIndicator size="small" color={colors.brandText} />
        ) : (
          <DownloadSimpleIcon size={18} color={colors.contentSubtle} />
        )}
      </Pressable>

      <Pressable
        onPress={() => openDocument('https://clubber.social/privacidade')}
        className="flex-row items-center gap-2 px-1"
      >
        <ArrowSquareOutIcon size={14} color={colors.brandText} />
        <Text className="text-brand-text text-sm">{t('privacy.policy')}</Text>
      </Pressable>

      <View className="gap-3 mt-2">
        <Button label={t('common.continue')} onPress={onContinue} />
        <Button label={t('common.back')} onPress={onBack} variant="secondary" />
      </View>
    </View>
  )
}
