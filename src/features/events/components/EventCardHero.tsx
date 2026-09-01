import type { ReactNode } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { LockIcon } from 'phosphor-react-native'
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
} from 'react-native-svg'
import { EventStatusBadge } from './EventStatusBadge'
import { EventCardMenu } from './EventCardMenu'
import { EventCardLocationBar } from './EventCardLocationBar'
import { PERFORATION_OVERLAP } from '@/shared/components/TicketPerforation'
import { SponsoredBadge } from '@/features/featured-events/components/SponsoredBadge'
import { ProfileLink } from '@/features/users/components/ProfileLink'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { useCategories } from '@/shared/hooks/useCategories'
import { useLocale } from '@/shared/hooks/useLocale'
import { formatFullName } from '@/shared/utils/fullName'
import { formatRelative } from '@/shared/utils/dateFormat'
import { eventCategoryEmoji } from '@/shared/utils/eventCategoryEmoji'
import type { FeedEvent } from '@/shared/types'
import { categoryHue, colors } from '@/shared/theme'

type Props = {
  event: FeedEvent
  userCoords: [number, number] | null
  // Toque na barra de local — leva ao detalhe, igual ao resto da capa.
  onPress: () => void
  /**
   * Banner de motivo do feed. Vem por aqui, e não como irmão do hero, porque na
   * capa SEM FOTO ele precisa cair DENTRO do gradiente de categoria: dois
   * gradientes vizinhos nunca leem como um só. Com foto ele volta a ser uma
   * faixa própria acima da imagem, que é onde já estava.
   */
  banner?: ReactNode
}

// Respiro padrão da capa (o p-3 / inset-x-3 das duas variantes).
const BASE_PADDING = 12
// Exportado pro EventCardSkeleton reservar a mesma altura de capa.
export const PHOTO_RATIO = 4 / 5
const TITLE_SIZE_PHOTO = 32
const TITLE_SIZE_PLAIN = 26

// Sombra de texto pra manter a assinatura legível sobre fotos claras (junto do
// scrim). Só na capa com foto: sobre a capa-gradiente não há o que compensar.
const textShadow = {
  textShadowColor: 'rgba(0,0,0,0.7)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
}

/**
 * Fundo dos SVGs de capa. `width="100%"` sem viewBox não resolve exato contra o
 * tamanho real da view: sobrava um fio de foto sem scrim no topo e na direita.
 * Com viewBox o espaço do SVG mapeia direto no viewport, e a sangria de 1
 * unidade em volta cobre qualquer arredondamento que ainda apareça.
 */
const SCRIM_VIEWBOX = '0 0 100 100'
const SCRIM_BLEED = { x: -1, y: -1, width: 102, height: 102 } as const

function titleStyle(size: number) {
  return { fontSize: size, lineHeight: size * 1.02, letterSpacing: -1 }
}

function PrivatePill() {
  const { t } = useTranslation()
  return (
    <View className="flex-row items-center gap-1 rounded-full border border-white/15 bg-background/70 px-2 py-1">
      <LockIcon size={11} color={colors.contentTertiary} />
      <Text className="text-[11px] font-semibold text-content-tertiary">
        {t('events.visibility.private')}
      </Text>
    </View>
  )
}

// Faixa de metadados no pé do pôster: o que é o rolê e em que estado está.
// Categoria e status ficam lado a lado (e não numa pílula só) porque o rótulo
// de status é decisão do EventStatusBadge — SOON/faltam N dias/encerrado, e o
// espectro do LivePill quando está ONGOING. Recriar essa régua aqui abriria uma
// segunda fonte da verdade pra mesma regra.
function MetaChips({ event }: { event: FeedEvent }) {
  const { categories: tree } = useCategories()
  const primary = event.categories[0]
  const label = tree.find(entry => entry.value === primary)?.label

  return (
    <View className="flex-row flex-wrap items-center gap-1.5">
      {!!label && (
        <View className="flex-row items-center gap-1 rounded-full bg-surface/80 px-2.5 py-1">
          <Text className="text-[11px]">
            {eventCategoryEmoji(event.categories)}
          </Text>
          <Text className="text-[11px] font-bold text-content-secondary">
            {label}
          </Text>
        </View>
      )}
      <EventStatusBadge status={event.status} date={event.date} />
      {event.isFeatured && <SponsoredBadge />}
      {!event.isPublic && <PrivatePill />}
    </View>
  )
}

function OrganizerLine({
  event,
  shadowed,
}: {
  event: FeedEvent
  shadowed: boolean
}) {
  const { t } = useTranslation()
  const locale = useLocale()
  const style = shadowed ? textShadow : undefined

  return (
    <ProfileLink
      userId={event.author.id}
      username={event.author.username}
      className="flex-1 flex-row items-center gap-2"
    >
      <View className="rounded-full border-2 border-white/80">
        <UserAvatar
          name={event.author.name}
          avatarUrl={event.author.avatarUrl}
          size={32}
        />
      </View>
      <View className="flex-1">
        <Text
          className="text-[13px] font-bold text-content"
          numberOfLines={1}
          style={style}
        >
          {formatFullName(event.author.name, event.author.lastname)}
        </Text>
        <Text
          className="text-[11px] text-content-tertiary"
          numberOfLines={1}
          style={style}
        >
          {`${t('events.organizer')} · ${formatRelative(event.createdAt, locale)}`}
        </Text>
      </View>
    </ProfileLink>
  )
}

/**
 * A capa do card — o pôster. Com foto ela é a foto; sem foto, uma superfície
 * neutra com o emoji da categoria como marca d'água. A ESTRUTURA é a mesma nos
 * dois casos (assinatura no topo, metadados + título + local no pé) pra o feed
 * não ter dois ritmos de leitura.
 */
export function EventCardHero({ event, userCoords, onPress, banner }: Props) {
  const imageUrl = event.images[0]?.url ?? null
  const scrimId = `card-scrim-${event.id}`
  const signatureId = `card-signature-${event.id}`
  const cover = categoryHue(event.categories[0]).cover
  const plainId = `card-plain-${event.id}`

  if (imageUrl) {
    return (
      <View>
        {banner}
        <View className="relative">
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', aspectRatio: PHOTO_RATIO }}
            className="bg-surface-elevated"
            resizeMode="cover"
          />
          {/* Escuro no topo pra assinatura, limpo no meio pra foto, e no pé
            fundindo na SUPERFÍCIE do card (não no fundo da página) até opacidade
            1: parando em 0.95 sobravam 5% de foto vazando por cima do picote, e
            terminar na cor errada deixava um degrau de tom na emenda. */}
          <Svg
            style={StyleSheet.absoluteFill}
            viewBox={SCRIM_VIEWBOX}
            preserveAspectRatio="none"
            pointerEvents="none"
          >
            <Defs>
              <LinearGradient id={scrimId} x1="0" y1="0" x2="0" y2="1">
                <Stop
                  offset="0"
                  stopColor={colors.background}
                  stopOpacity={0.14}
                />
                <Stop
                  offset="0.28"
                  stopColor={colors.background}
                  stopOpacity={0}
                />
                <Stop
                  offset="0.64"
                  stopColor={colors.surface}
                  stopOpacity={0.12}
                />
                <Stop
                  offset="0.86"
                  stopColor={colors.surface}
                  stopOpacity={0.7}
                />
                <Stop offset="1" stopColor={colors.surface} stopOpacity={1} />
              </LinearGradient>
              {/* Reforço só no canto da assinatura. Radial ancorado no topo-
                esquerdo porque ele decai sozinho para a direita E para baixo —
                um gradiente linear horizontal precisaria de máscara pra não
                deixar aresta dura no pé da faixa. */}
              <RadialGradient
                id={signatureId}
                cx="0"
                cy="0"
                rx="58"
                ry="34"
                fx="0"
                fy="0"
              >
                <Stop
                  offset="0"
                  stopColor={colors.background}
                  stopOpacity={0.42}
                />
                <Stop
                  offset="1"
                  stopColor={colors.background}
                  stopOpacity={0}
                />
              </RadialGradient>
            </Defs>
            <Rect {...SCRIM_BLEED} fill={`url(#${scrimId})`} />
            <Rect {...SCRIM_BLEED} fill={`url(#${signatureId})`} />
          </Svg>

          <View
            className="absolute inset-x-3 top-3 flex-row items-center gap-2"
            pointerEvents="box-none"
          >
            <OrganizerLine event={event} shadowed />
            <EventCardMenu eventId={event.id} authorId={event.author.id} />
          </View>

          <View
            className="absolute inset-x-3 gap-2.5"
            // Mesmo recuo da capa sem foto: o picote avança por cima daqui.
            style={{ bottom: BASE_PADDING + PERFORATION_OVERLAP }}
            pointerEvents="box-none"
          >
            <MetaChips event={event} />
            <Text
              className="font-extrabold uppercase text-content"
              numberOfLines={2}
              style={{ ...titleStyle(TITLE_SIZE_PHOTO), ...textShadow }}
            >
              {event.title}
            </Text>
            <EventCardLocationBar
              event={event}
              userCoords={userCoords}
              onPress={onPress}
              glass
            />
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="relative overflow-hidden bg-surface">
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox={SCRIM_VIEWBOX}
        preserveAspectRatio="none"
        pointerEvents="none"
      >
        <Defs>
          {/* Capa no matiz da CATEGORIA (cor é informação): o card sem foto
              deixa de ser cinza e diz o tipo do rolê antes da leitura. Mesma
              escala do chip e da gota do mapa — ver categoryHues.

              Corre do canto INFERIOR DIREITO para o SUPERIOR ESQUERDO, onde
              fica a massa de cor: é o mesmo canto em que o FeedReasonBanner
              logo acima concentra o tint dele (horizontal, cheio à esquerda).
              Na direção oposta as duas peças brigavam na emenda. */}
          <LinearGradient id={plainId} x1="1" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor={cover[0]} />
            <Stop offset="0.55" stopColor={cover[1]} />
            <Stop offset="1" stopColor={cover[2]} />
          </LinearGradient>
        </Defs>
        <Rect {...SCRIM_BLEED} fill={`url(#${plainId})`} />
      </Svg>
      <View
        className="absolute -right-2 top-10"
        style={{ opacity: 0.25 }}
        pointerEvents="none"
      >
        <Text className="text-[84px]">
          {eventCategoryEmoji(event.categories)}
        </Text>
      </View>

      {/* Dentro do gradiente, não acima dele: é o que faz banner e capa lerem
          como uma superfície só. O container não tem padding, então a faixa já
          vai de ponta a ponta — quem recua é o bloco de conteúdo abaixo. */}
      {banner}

      {/* O ⋯ ancora no CANTO da capa, não na linha do organizador: ali ele
          descia até a metade do avatar, longe do topo. Com faixa de motivo ele
          se aloja DENTRO dela (que ganha altura pra isso) em vez de cruzar a
          régua; sem faixa, encosta no topo da capa. */}
      <View
        className={`absolute right-3 z-10 ${banner ? 'top-0.5' : 'top-3'}`}
        pointerEvents="box-none"
      >
        <EventCardMenu eventId={event.id} authorId={event.author.id} />
      </View>

      <View
        className="gap-2.5 p-3"
        // Espaço pro picote, que avança por cima da capa. Sem ele o recorte é
        // desenhado sobre a barra de local.
        style={{ paddingBottom: BASE_PADDING + PERFORATION_OVERLAP }}
        pointerEvents="box-none"
      >
        {/* Recuo pro ⋯ flutuante — a assinatura passaria por baixo dele.
            flex-row porque o ProfileLink traz flex-1: numa coluna isso vira
            base VERTICAL 0 e o Yoga colapsa a linha no primeiro passe — a capa
            crescia depois do mount e o Fabric não reposicionava o picote. */}
        <View className="flex-row pr-10" pointerEvents="box-none">
          <OrganizerLine event={event} shadowed={false} />
        </View>
        <MetaChips event={event} />
        <Text
          className="font-extrabold uppercase text-content"
          numberOfLines={2}
          style={titleStyle(TITLE_SIZE_PLAIN)}
        >
          {event.title}
        </Text>
        <EventCardLocationBar
          event={event}
          userCoords={userCoords}
          onPress={onPress}
        />
      </View>
    </View>
  )
}
