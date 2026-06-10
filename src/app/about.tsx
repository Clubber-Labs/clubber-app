import { ScrollView, View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Linking from 'expo-linking'
import Constants from 'expo-constants'

const VERSION = Constants.expoConfig?.version ?? '—'

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
      className={`flex-row items-center justify-between py-3 ${showBorder ? 'border-t border-zinc-800' : ''}`}
    >
      <Text className="text-zinc-200 text-base">{label}</Text>
      <Ionicons name="open-outline" size={18} color="#a1a1aa" />
    </Pressable>
  )
}

export default function AboutScreen() {
  return (
    <ScrollView
      className="flex-1 bg-black"
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <View className="gap-1">
        <Text className="text-2xl font-bold text-white">ConnectAI</Text>
        <Text className="text-sm text-zinc-400">Versão {VERSION}</Text>
      </View>

      <View className="gap-2">
        <Text className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
          Mapas
        </Text>
        <Text className="text-sm text-zinc-300 leading-5">
          Os mapas exibidos no app são fornecidos pela Mapbox e usam dados do
          OpenStreetMap, mantidos por uma comunidade de colaboradores ao redor
          do mundo.
        </Text>
        <View className="bg-zinc-900 border border-zinc-800 rounded-xl px-4">
          <LinkRow label="© Mapbox" url="https://www.mapbox.com/about/maps/" />
          <LinkRow
            label="© OpenStreetMap"
            url="https://www.openstreetmap.org/copyright"
            showBorder
          />
          <LinkRow
            label="Melhorar este mapa"
            url="https://apps.mapbox.com/feedback/"
            showBorder
          />
        </View>
      </View>
    </ScrollView>
  )
}
