import { useId, useState, type ReactNode } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { CaretLeftIcon, LockIcon } from 'phosphor-react-native'
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Rect,
} from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import {
  formatDayNumber,
  formatMonthShort,
  formatTime,
  formatWeekday,
} from '@/shared/utils/dateFormat'
import { useLocale } from '@/shared/hooks/useLocale'
import { formatFullName } from '@/shared/utils/fullName'
import { CategoryBadge } from '@/shared/components/CategoryBadge'
import { ImageViewerModal } from '@/shared/components/ImageViewerModal'
import { ProfileLink } from '@/features/users/components/ProfileLink'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { EventStatusBadge } from './EventStatusBadge'
import { EventImagesCarousel } from './EventImagesCarousel'
import type { EventDetail } from '@/shared/types'
import { colors, SPECTRUM } from '@/shared/theme'

type Props = {
  event: EventDetail
  // Voltar — vira botão flutuante no topo-esquerdo (hero imersivo sem header).
  onBack?: () => void
  // Menu do autor (editar/excluir) ou botão de denúncia — definido pela tela,
  // sobreposto no topo-direito do hero.
  actions?: ReactNode
}

const HERO_HEIGHT = 560

// Uma linha só de "quando e onde", em caixa alta: o título já é o peso da
// composição, então a data desce a hierarquia sem virar meta-row.
function posterDateLine(event: EventDetail, locale: string): string {
  const timezone = event.timezone ?? undefined
  // Abreviações vêm com ponto em vários idiomas ("sáb.", "set.") — em caixa
  // alta e com o separador ·, o ponto vira sujeira.
  const strip = (value: string) => value.replace(/\./g, '')
  const when = [
    strip(formatWeekday(event.date, locale, timezone)),
    `${formatDayNumber(event.date, locale, timezone)} ${strip(
      formatMonthShort(event.date, locale, timezone),
    )}`,
    formatTime(event.date, locale, timezone),
  ].join(' · ')
  return event.venueName ? `${when} — ${event.venueName}` : when
}

// O pôster manda no tamanho, o título manda de volta: 40px é o alvo, mas título
// longo precisa caber em 3 linhas sem virar parágrafo.
function posterTitleSize(title: string): number {
  if (title.length <= 28) return 40
  if (title.length <= 50) return 34
  return 28
}

// Fio do espectro sob o hero — segundo (e último) uso do gradiente-assinatura,
// ao lado da LivePill. Fundo via SVG com bounds em pixel, mesma receita da
// pílula: dimensão em % não re-resolve na new arch no 1º layout.
function SpectrumRule() {
  const gradientId = `event-hero-rule-${useId().replace(/:/g, '')}`
  return (
    <View className="h-[3px] w-full" pointerEvents="none">
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={SPECTRUM[0]} />
            <Stop offset="0.5" stopColor={SPECTRUM[1]} />
            <Stop offset="1" stopColor={SPECTRUM[2]} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  )
}

export function EventHeader({ event, onBack, actions }: Props) {
  const { t } = useTranslation()
  const locale = useLocale()
  const insets = useSafeAreaInsets()
  const [imageIndex, setImageIndex] = useState(0)
  // O pôster corta a foto (cover, 560px); tocar abre a imagem inteira.
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null)
  const hasImages = event.images.length > 0
  const gradId = `event-hero-grad-${event.id}`
  const scrimId = `event-hero-scrim-${event.id}`
  const category = event.categories[0]
  const titleSize = posterTitleSize(event.title)

  return (
    <View>
      {/* HERO full-bleed: -mx-4 cancela o padding (16px) do container pai. */}
      <View className="relative -mx-4">
        <View style={{ height: HERO_HEIGHT }} className="overflow-hidden">
          {hasImages ? (
            <EventImagesCarousel
              images={event.images}
              height={HERO_HEIGHT}
              showDots={false}
              onIndexChange={setImageIndex}
              onPressImage={position =>
                setExpandedUrl(event.images[position]?.url ?? null)
              }
            />
          ) : (
            <Svg style={StyleSheet.absoluteFill}>
              <Defs>
                <RadialGradient id={gradId} cx="0" cy="0" r="1">
                  <Stop offset="0" stopColor={colors.brandSurfaceStrong} />
                  <Stop offset="0.62" stopColor={colors.surface} />
                </RadialGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill={`url(#${gradId})`}
              />
            </Svg>
          )}
        </View>

        {/* Scrim: transparente no alto, opaco no rodapé — o último pixel é o
            próprio background, e o pôster funde na página sem costura. */}
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <LinearGradient id={scrimId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.background} stopOpacity={0} />
              <Stop
                offset="0.35"
                stopColor={colors.background}
                stopOpacity={0.12}
              />
              <Stop
                offset="0.62"
                stopColor={colors.background}
                stopOpacity={0.55}
              />
              <Stop
                offset="0.85"
                stopColor={colors.background}
                stopOpacity={0.9}
              />
              <Stop offset="1" stopColor={colors.background} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill={`url(#${scrimId})`}
          />
        </Svg>

        {/* box-none em toda camada sobreposta: o pôster inteiro responde ao
            toque (abre a foto), menos onde há botão ou link de perfil. */}
        <View
          className="absolute inset-x-4 flex-row items-center justify-between"
          style={{ top: insets.top + 8 }}
          pointerEvents="box-none"
        >
          {onBack ? (
            <Pressable
              onPress={onBack}
              accessibilityLabel={t('common.back')}
              hitSlop={8}
              className="h-10 w-10 items-center justify-center rounded-full bg-background/50"
            >
              <CaretLeftIcon size={24} color={colors.content} />
            </Pressable>
          ) : (
            <View className="h-10 w-10" />
          )}
          {actions ?? <View className="h-10 w-10" />}
        </View>

        {event.images.length > 1 && (
          <View
            className="absolute right-4 rounded-full bg-background/50 px-2.5 py-1"
            style={{ top: insets.top + 56 }}
            pointerEvents="none"
          >
            <Text className="text-content text-xs font-semibold">
              {`${imageIndex + 1}/${event.images.length}`}
            </Text>
          </View>
        )}

        <View
          className="absolute inset-x-4 bottom-5 gap-3"
          pointerEvents="box-none"
        >
          <View
            className="flex-row flex-wrap items-center gap-2"
            pointerEvents="none"
          >
            <EventStatusBadge status={event.status} date={event.date} />
            {!!category && <CategoryBadge value={category} />}
            {!event.isPublic && (
              <View className="flex-row items-center gap-1 rounded-full bg-background/60 px-2.5 py-1">
                <LockIcon size={11} color={colors.contentTertiary} />
                <Text className="text-content-tertiary text-xs font-semibold">
                  {t('events.visibility.private')}
                </Text>
              </View>
            )}
          </View>

          <View className="gap-2" pointerEvents="none">
            <Text
              className="text-content font-extrabold uppercase"
              numberOfLines={3}
              style={{
                fontSize: titleSize,
                lineHeight: titleSize * 1.02,
                letterSpacing: -titleSize * 0.025,
              }}
            >
              {event.title}
            </Text>
            <Text
              className="text-content-secondary text-[13px] font-semibold uppercase tracking-[1.5px]"
              numberOfLines={2}
            >
              {posterDateLine(event, locale)}
            </Text>
          </View>

          <ProfileLink
            userId={event.author.id}
            username={event.author.username}
            className="flex-row items-center gap-2.5 pt-1"
          >
            <View className="rounded-full border-2 border-white/70">
              <UserAvatar
                name={formatFullName(event.author.name, event.author.lastname)}
                avatarUrl={event.author.avatarUrl}
                size={38}
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-content text-[15px] font-bold"
                numberOfLines={1}
              >
                {formatFullName(event.author.name, event.author.lastname)}
              </Text>
              <Text className="text-content-tertiary text-xs">
                {t('events.organizer')}
              </Text>
            </View>
          </ProfileLink>
        </View>
      </View>

      {event.status === 'ONGOING' && (
        <View className="-mx-4">
          <SpectrumRule />
        </View>
      )}

      <ImageViewerModal
        url={expandedUrl}
        onClose={() => setExpandedUrl(null)}
      />
    </View>
  )
}
