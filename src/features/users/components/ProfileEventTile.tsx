import { memo, useState } from 'react'
import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ClockIcon, UsersIcon } from 'phosphor-react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { LivePill } from '@/shared/components/LivePill'
import { CardHighlightFrame } from '@/shared/components/CardHighlightFrame'
import {
  TicketPerforation,
  perforationOverlap,
} from '@/shared/components/TicketPerforation'
import { TicketOutline } from '@/shared/components/TicketOutline'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { useLocale } from '@/shared/hooks/useLocale'
import {
  formatDayNumber,
  formatMonthShort,
  formatShortDate,
  formatTime,
} from '@/shared/utils/dateFormat'
import { eventCategoryEmoji } from '@/shared/utils/eventCategoryEmoji'
import type { UserEventSummary } from '@/shared/types'
import { categoryHue, colors, METAL, SPECTRUM } from '@/shared/theme'

type Props = {
  event: UserEventSummary
  // Dono do perfil: é o que decide se a assinatura do rodapé leva o "por".
  ownerId: string
  onPress: (event: UserEventSummary) => void
}

// Altura fixa da arte: é ela que mantém a grade alinhada quando um título ocupa
// uma linha e o vizinho ocupa duas. Exportada pro fantasma do carregamento
// reservar exatamente o mesmo espaço.
export const PROFILE_TILE_ART_HEIGHT = 200
const TILE_RADIUS = 12
// Furo do picote: o tile tem metade da largura do card do feed, então o raio
// de lá comeria a arte. Exportado pro fantasma somar o que o picote avança.
export const PROFILE_TILE_NOTCH_RADIUS = 8
const TILE_PERFORATION_OVERLAP = perforationOverlap(PROFILE_TILE_NOTCH_RADIUS)
// Respiro do título da PlainCover ao pé da arte.
const PLAIN_TITLE_INSET = 10
// Foto do criador no rodapé: pequena o bastante pra não competir com o título.
const AVATAR_SIZE = 24
// Vidro escuro dos sobrepostos — o único que encosta na arte do flyer.
const OVERLAY_BG = 'rgba(11, 11, 13, 0.65)'
// viewBox mapeia o espaço do SVG direto no viewport; "100%" sozinho não resolve
// exato e deixa um fio sem pintura na borda (mesma correção do EventCardHero).
const COVER_VIEWBOX = '0 0 100 100'
const COVER_BLEED = { x: -1, y: -1, width: 102, height: 102 } as const

// Chave, não frase: a constante avalia no import e congelaria o idioma.
const PEOPLE_KEYS = {
  live: 'profile.eventTile.here',
  past: 'profile.eventTile.went',
  upcoming: 'profile.eventTile.going',
} as const

function TileDate({
  event,
  muted,
}: {
  event: UserEventSummary
  muted: boolean
}) {
  const locale = useLocale()
  const zone = event.timezone ?? undefined
  // A abreviação vem com ponto em vários idiomas ("mar.", "ene.") — só o ponto
  // sai; filtrar por [^a-zA-Z] comeria as acentuadas.
  const month = formatMonthShort(event.date, locale, zone)
    .replace(/\./g, '')
    .toUpperCase()

  return (
    <View
      className="w-[38px] overflow-hidden rounded-md"
      style={{ backgroundColor: OVERLAY_BG }}
    >
      <Text
        className={`py-px text-center text-[8px] font-extrabold uppercase ${
          muted
            ? 'bg-surface-elevated text-content-muted'
            : 'bg-surface-high text-content'
        }`}
        style={{ letterSpacing: 1 }}
      >
        {month}
      </Text>
      <Text
        className={`py-0.5 text-center text-sm font-extrabold leading-none ${
          muted ? 'text-content-muted' : 'text-content'
        }`}
      >
        {formatDayNumber(event.date, locale, zone)}
      </Text>
    </View>
  )
}

function TileSeal({ label, danger }: { label: string; danger: boolean }) {
  return (
    <View
      className="rounded-md px-1.5 py-0.5"
      style={{ backgroundColor: OVERLAY_BG }}
    >
      <Text
        className={`text-[10px] font-bold ${
          danger ? 'text-danger-text' : 'text-content-muted'
        }`}
      >
        {label}
      </Text>
    </View>
  )
}

/**
 * Capa de quem não subiu flyer: pôster tipográfico, na mesma língua do card do
 * feed. É a ÚNICA variante em que o título entra na arte — aqui não há arte a
 * preservar, e a capa vazia sem o nome do evento não diz nada.
 */
function PlainCover({ event }: { event: UserEventSummary }) {
  const gradientId = `ptile-plain-${event.id}`
  // Mesmo matiz do card do feed (categoryHue): o evento sem foto diz a
  // categoria pela cor. Corre do canto inferior direito pro superior esquerdo,
  // como lá — a massa de cor fica no topo e o título cai sobre a parte escura.
  const cover = categoryHue(event.categories[0]).cover
  return (
    <>
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox={COVER_VIEWBOX}
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id={gradientId} x1="1" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor={cover[0]} />
            <Stop offset="0.55" stopColor={cover[1]} />
            <Stop offset="1" stopColor={cover[2]} />
          </LinearGradient>
        </Defs>
        <Rect {...COVER_BLEED} fill={`url(#${gradientId})`} />
      </Svg>
      <Text
        className="absolute top-6 right-1"
        style={{ fontSize: 64, opacity: 0.25 }}
      >
        {eventCategoryEmoji(event.categories)}
      </Text>
      <Text
        className="absolute inset-x-2.5 font-extrabold uppercase text-content"
        numberOfLines={3}
        // O picote avança por cima do pé da arte: o título sobe junto, senão
        // o tracejado corta a última linha.
        style={{
          bottom: PLAIN_TITLE_INSET + TILE_PERFORATION_OVERLAP,
          fontSize: 24,
          lineHeight: 24,
          letterSpacing: -0.3,
        }}
      >
        {event.title}
      </Text>
    </>
  )
}

/**
 * Tile da vitrine de eventos do perfil. A ARTE DO FLYER FICA INTACTA: nada de
 * scrim nem de título por cima dela — a informação toda mora num rodapé fora da
 * imagem. O que encosta na arte é só o carimbo de data (ou o "agora") e, quando
 * o evento já passou, o selo de encerrado.
 */
export const ProfileEventTile = memo(function ProfileEventTile({
  event,
  ownerId,
  onPress,
}: Props) {
  const { t } = useTranslation()
  const locale = useLocale()
  const zone = event.timezone ?? undefined
  const imageUrl = event.images[0]?.url ?? null
  // A aresta é desenhada, não é `border` — ver TicketOutline. Ela e a moldura
  // precisam do tamanho real e de onde o picote caiu.
  const [tileSize, setTileSize] = useState<{ w: number; h: number } | null>(
    null,
  )
  const [notchY, setNotchY] = useState<number | null>(null)
  // Só assina o que é de OUTRA pessoa: a vitrine mistura o que o dono criou com
  // o que ele vai, e a assinatura é o que separa os dois. Repetir a cara dele em
  // todo tile do próprio perfil só pesa — a autoria dele já é o padrão ali.
  const host = event.author && event.author.id !== ownerId ? event.author : null

  // `status` vem calculado do backend em TODA resposta desta rota (o normalize
  // da listagem compartilhada o preenche), e o mobile nunca o deriva da data —
  // mesma premissa do EventStatusBadge. O opcional no tipo é só tolerância a
  // contrato antigo; nesse caso a fase cai em "upcoming", que mostra a hora do
  // evento (fato que vem do `date`) e nenhum selo.
  const live = event.status === 'ONGOING'
  const canceled = event.status === 'CANCELED'
  const closed = event.status === 'PAST' || canceled
  const phase = live ? 'live' : closed ? 'past' : 'upcoming'
  // Mesma régua do card do feed: ao vivo = espectro, promovido = metal, e o
  // ao vivo vence quando coincidem.
  const framed = live || !!event.isFeatured
  const frameStops = live ? SPECTRUM : METAL

  const attendees = event._count?.attendances
  const people =
    attendees === undefined ? null : t(PEOPLE_KEYS[phase], { count: attendees })
  // Antes do evento a hora é a informação principal e a contagem acompanha;
  // durante e depois, quem manda é quem está (ou esteve) lá.
  const meta =
    phase === 'upcoming'
      ? [formatTime(event.date, locale, zone), people]
          .filter(Boolean)
          .join(' · ')
      : people

  return (
    <Pressable
      onPress={() => onPress(event)}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${formatShortDate(
        event.date,
        locale,
        zone,
      )}, ${formatTime(event.date, locale, zone)}`}
      className="mb-2 flex-1 overflow-hidden rounded-xl bg-surface"
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout
        setTileSize(prev =>
          prev?.w === width && prev?.h === height
            ? prev
            : { w: width, h: height },
        )
      }}
    >
      <View
        className="bg-surface-elevated"
        style={{ height: PROFILE_TILE_ART_HEIGHT }}
      >
        {/* Só a arte esmaece no encerrado — carimbo e selo continuam legíveis. */}
        <View
          style={StyleSheet.absoluteFill}
          className={closed ? 'opacity-70' : ''}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
          ) : (
            <PlainCover event={event} />
          )}
        </View>

        <View className="absolute left-2 top-2">
          {live ? (
            <LivePill compact />
          ) : (
            <TileDate event={event} muted={closed} />
          )}
        </View>
        {closed && (
          <View className="absolute right-2 top-2">
            <TileSeal
              label={t(
                canceled ? 'events.status.canceled' : 'events.status.past',
              )}
              danger={canceled}
            />
          </View>
        )}
      </View>

      {/* O picote cavalga a emenda arte/rodapé: o centro dos furos cai na
          borda inferior da foto (ou do gradiente), como no card do feed. */}
      <TicketPerforation
        radius={PROFILE_TILE_NOTCH_RADIUS}
        onCenterChange={center =>
          setNotchY(prev => (prev === center ? prev : center))
        }
      />

      <View className="px-2.5 pb-2.5 pt-1">
        <Text
          className={`text-[13px] font-extrabold ${
            closed ? 'text-content-muted' : 'text-content'
          }`}
          style={{ lineHeight: 16 }}
          numberOfLines={2}
        >
          {event.title}
        </Text>
        {!!meta && (
          <View className="mt-[3px] flex-row items-center gap-1">
            {phase === 'upcoming' ? (
              <ClockIcon size={11} color={colors.contentMuted} />
            ) : (
              <UsersIcon size={11} color={colors.contentMuted} />
            )}
            <Text className="text-[11px] text-content-muted" numberOfLines={1}>
              {meta}
            </Text>
          </View>
        )}
        {!!host && (
          <View className="mt-1.5 flex-row items-center gap-1.5">
            <UserAvatar
              name={host.name}
              avatarUrl={host.avatarUrl}
              size={AVATAR_SIZE}
            />
            <Text
              className="flex-1 text-[11px] text-content-subtle"
              numberOfLines={1}
            >
              {/* @username em vez do nome completo: em duas colunas o nome
                  estoura e trunca antes de identificar quem é. */}
              {t('profile.eventTile.by', { name: `@${host.username}` })}
            </Text>
          </View>
        )}
      </View>

      {/* Aresta por cima do conteúdo, senão os furos não perfuram a arte. */}
      {!!tileSize && notchY !== null && (
        <TicketOutline
          width={tileSize.w}
          height={tileSize.h}
          notchY={notchY}
          notchRadius={PROFILE_TILE_NOTCH_RADIUS}
          radius={TILE_RADIUS}
        />
      )}

      {/* Moldura de destaque: a mesma peça medida em pixel que o card do feed
          usa, mergulhando no mesmo picote que a aresta. Um gradiente de fundo
          clipado pelo raio do tile deixaria escapar a base nas quinas — ver
          StatusChip. */}
      {framed && (
        <CardHighlightFrame
          stops={frameStops}
          radius={TILE_RADIUS}
          notch={
            notchY === null
              ? null
              : { y: notchY, radius: PROFILE_TILE_NOTCH_RADIUS }
          }
        />
      )}
    </Pressable>
  )
})
