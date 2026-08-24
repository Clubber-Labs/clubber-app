import { ScrollView, View, Text, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ArrowSquareOutIcon } from 'phosphor-react-native'
import * as Linking from 'expo-linking'
import Constants from 'expo-constants'
import { bundleIdentity } from '@/shared/lib/updates'
import { colors } from '@/shared/theme'

const VERSION = Constants.expoConfig?.version ?? '—'
const BUNDLE = bundleIdentity()

type LinkRowProps = {
  label: string
  url: string
  showBorder?: boolean
}

function LinkRow({ label, url, showBorder }: LinkRowProps) {
  return (
    <Pressable
      onPress={() => {
        void Linking.openURL(url).catch(() => {})
      }}
      className={`flex-row items-center justify-between py-3 ${showBorder ? 'border-t border-line' : ''}`}
    >
      <Text className="text-content-secondary text-base">{label}</Text>
      <ArrowSquareOutIcon size={18} color={colors.contentMuted} />
    </Pressable>
  )
}

export default function AboutScreen() {
  const { t } = useTranslation()
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <View className="gap-1">
        <Text className="text-2xl font-bold text-content">Clubber</Text>
        <Text className="text-sm text-content-muted">
          {t('about.version', { version: VERSION })}
        </Text>
        {/* Sem rótulo traduzido de propósito: é um identificador técnico, o que
            se pede pra pessoa ler em voz alta quando reporta um bug. */}
        <Text className="text-xs text-content-faint" selectable>
          {BUNDLE}
        </Text>
      </View>

      <View className="gap-2">
        <Text className="text-xs uppercase tracking-wider text-content-subtle font-semibold">
          {t('about.mapsTitle')}
        </Text>
        <Text className="text-sm text-content-tertiary leading-5">
          {t('about.mapsBody')}
        </Text>
        <View className="bg-surface border border-line rounded-xl px-4">
          <LinkRow label="© Mapbox" url="https://www.mapbox.com/about/maps/" />
          <LinkRow
            label="© OpenStreetMap"
            url="https://www.openstreetmap.org/copyright"
            showBorder
          />
          <LinkRow
            label={t('about.improveMap')}
            url="https://apps.mapbox.com/feedback/"
            showBorder
          />
        </View>
      </View>
    </ScrollView>
  )
}
