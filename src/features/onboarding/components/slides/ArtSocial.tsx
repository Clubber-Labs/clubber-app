import { StyleSheet, View, Text } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { LivePill } from '@/shared/components/LivePill'
import { SPECTRUM } from '@/shared/theme'
import { Enter } from '../Enter'
import { ART_BOX, FIELD_DRINKS } from '../../constants'
import type { ArtProps } from '../../types'

// Slide 4 — Chega junto: card do evento + conversa, subindo em cascata.
export function ArtSocial({ active }: ArtProps) {
  return (
    <View className="gap-2.5" style={{ width: ART_BOX.width }}>
      <Enter active={active} variant="rise">
        <View className="rounded-2xl bg-surface border border-line overflow-hidden">
          {/* Capa do evento: espectro esmaecido (mesma régua do mockup) — o
              LivePill vivo por cima é quem carrega o "ao vivo". */}
          <View
            className="bg-brand-surface-strong justify-end p-2.5"
            style={{ height: 88 }}
          >
            <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
              <Defs>
                <LinearGradient id="onb-hero-grad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={SPECTRUM[0]} />
                  <Stop offset="0.5" stopColor={SPECTRUM[1]} />
                  <Stop offset="1" stopColor={SPECTRUM[2]} />
                </LinearGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#onb-hero-grad)"
                fillOpacity={0.5}
              />
            </Svg>
            <View className="self-start">
              <LivePill label="Rolando agora" />
            </View>
          </View>
          <View className="p-3 gap-2">
            <Text className="text-[13px] font-bold text-content">
              Festival na Pedreira
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="flex-row">
                <View
                  className="w-6 h-6 rounded-full border-2 border-surface items-center justify-center"
                  style={{ backgroundColor: FIELD_DRINKS }}
                >
                  <Text className="text-[9px] font-semibold text-content">
                    T
                  </Text>
                </View>
                <View className="w-6 h-6 rounded-full bg-surface-high border-2 border-surface items-center justify-center -ml-2">
                  <Text className="text-[9px] font-semibold text-content">
                    G
                  </Text>
                </View>
              </View>
              <Text className="text-[11px] text-content-muted">
                Théo e mais 4 vão
              </Text>
            </View>
          </View>
        </View>
      </Enter>
      <Enter active={active} variant="rise" delay={160}>
        <View className="rounded-2xl bg-surface border border-line p-3 gap-2">
          <View className="max-w-[85%] rounded-xl rounded-bl-sm bg-surface-elevated px-3 py-1.5">
            <Text className="text-sm text-content">Onde é o after? 🌤️</Text>
          </View>
          <View className="max-w-[85%] self-end rounded-xl rounded-br-sm bg-surface-high px-3 py-1.5">
            <Text className="text-sm text-content">
              Boaa. Vou ver no Clubber!
            </Text>
          </View>
        </View>
      </Enter>
    </View>
  )
}
