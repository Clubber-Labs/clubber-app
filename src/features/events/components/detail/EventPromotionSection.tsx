import { View, Text, Share } from 'react-native'
import {
  ChartBarIcon,
  EyeSlashIcon,
  LinkIcon,
  ShareNetworkIcon,
  StarIcon,
  UsersThreeIcon,
} from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { InstagramMark } from '@/shared/components/InstagramMark'
import { useBanner } from '@/shared/lib/banner'
import { useEventAnalytics } from '@/features/event-analytics/hooks/useEventAnalytics'
import { useCanShareToStories } from '../../hooks/useCanShareToStories'
import { useCreateInviteLink } from '../../hooks/useCreateInviteLink'
import { useEventInvites } from '../../hooks/useInvites'
import { useShareToStories } from '../../hooks/useShareToStories'
import { StoryArtCapture } from '../share/StoryArtCapture'
import { StoryLinkInstructions } from '../share/StoryLinkInstructions'
import { StoryLinkReturnSheet } from '../share/StoryLinkReturnSheet'
import { EventPromotionRow } from './EventPromotionRow'
import type { EventDetail } from '@/shared/types'
import { colors } from '@/shared/theme'

type Props = {
  event: EventDetail
  isPremium: boolean
  // Compartilhamento concluído — a tela liga isso ao tracking de analytics.
  onShared: () => void
}

// Bastidor do evento: tudo que só o autor vê e faz para encher a casa. Substitui
// os cards soltos de analytics/promover e tira o compartilhar de dentro de um
// ícone no hero — divulgar é trabalho, e trabalho vira lista.
export function EventPromotionSection({ event, isPremium, onShared }: Props) {
  const { t } = useTranslation()
  const router = useRouter()
  const showBanner = useBanner()
  const canShareToStories = useCanShareToStories()
  const stories = useShareToStories({ event, onShared })
  const createInviteLink = useCreateInviteLink(event.id)
  const { data: invited } = useEventInvites(event.id)
  const { stats } = useEventAnalytics(event.id, { enabled: isPremium })

  // Share do sistema (WhatsApp, mensagens, etc). O link é sempre o de convite
  // gerado pelo backend — o client nunca monta URL de convite na mão.
  async function shareToOtherApps() {
    try {
      const { url } = await createInviteLink.mutateAsync()
      const result = await Share.share({
        title: event.title,
        message: t('events.share.message', { title: event.title, url }),
      })
      if (result.action === Share.sharedAction) onShared()
    } catch {
      // Falha ao gerar o link ou share indisponível — silenciosa.
    }
  }

  async function copyInviteLink() {
    try {
      const { url } = await createInviteLink.mutateAsync()
      await Clipboard.setStringAsync(url)
      showBanner(t('events.detail.promotion.linkCopied'))
      onShared()
    } catch {
      // Falha ao gerar o link — silenciosa, mesmo padrão do resto do share.
    }
  }

  // Check-in entra na régua só quando o backend serve o bloco (ver EventCheckIns).
  const analyticsSummary = stats
    ? [
        t('events.detail.promotion.views', { count: stats.totals.views }),
        t('events.detail.promotion.shares', { count: stats.totals.shares }),
        ...(event.checkIns
          ? [
              t('events.detail.promotion.checkIns', {
                count: event.checkIns.count,
              }),
            ]
          : []),
      ].join(' · ')
    : isPremium
      ? t('analytics.entryHint')
      : t('analytics.entryLocked')

  const invitedCount = invited?.length ?? 0
  // Autor sem premium que já promoveu precisa chegar na tela pra cancelar —
  // o gate de assinatura é do promover, não do gerenciar (regra do backend).
  const canManagePromotion = isPremium || !!event.isFeatured

  return (
    <View>
      <View className="flex-row items-center justify-between pb-1">
        <Text className="text-content text-base font-extrabold">
          {t('events.detail.promotion.title')}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <EyeSlashIcon size={13} color={colors.contentSubtle} />
          <Text className="text-content-subtle text-xs">
            {t('events.detail.promotion.onlyYou')}
          </Text>
        </View>
      </View>

      {canShareToStories && (
        <EventPromotionRow
          icon={InstagramMark}
          label={t('events.detail.promotion.stories')}
          onPress={stories.start}
          disabled={stories.isPreparing}
        />
      )}
      <EventPromotionRow
        icon={ShareNetworkIcon}
        label={t('events.detail.promotion.otherApps')}
        onPress={shareToOtherApps}
        disabled={createInviteLink.isPending}
      />
      <EventPromotionRow
        icon={LinkIcon}
        label={t('events.detail.promotion.copyLink')}
        onPress={copyInviteLink}
        disabled={createInviteLink.isPending}
      />
      <EventPromotionRow
        icon={UsersThreeIcon}
        // A linha ABRE a tela de convidar; a contagem abaixo é só o estado.
        label={t('events.actions.invite')}
        subtitle={
          invitedCount > 0
            ? t('events.detail.promotion.guestsCount', { count: invitedCount })
            : t('events.detail.promotion.guestsEmpty')
        }
        onPress={() => router.push(`/events/${event.id}/invites`)}
      />
      <EventPromotionRow
        icon={ChartBarIcon}
        label={t('analytics.short')}
        subtitle={analyticsSummary}
        badge={isPremium ? undefined : t('billing.premium')}
        onPress={() =>
          router.push(
            isPremium ? `/events/${event.id}/analytics` : '/billing/upgrade',
          )
        }
      />
      <EventPromotionRow
        icon={StarIcon}
        label={t('featured.promote')}
        subtitle={event.isFeatured ? t('featured.active') : undefined}
        badge={isPremium ? undefined : t('billing.premium')}
        divider={false}
        onPress={() =>
          router.push(
            canManagePromotion
              ? `/events/${event.id}/promote`
              : '/billing/upgrade',
          )
        }
      />

      {stories.art && (
        <StoryArtCapture
          data={stories.art}
          onCaptured={stories.handleCaptured}
        />
      )}
      <StoryLinkInstructions
        visible={stories.instructionsVisible}
        onConfirm={stories.confirmInstructions}
        onClose={stories.dismissInstructions}
      />
      <StoryLinkReturnSheet
        visible={stories.returnSheetVisible}
        onCopy={stories.copyReturnLink}
        onClose={stories.dismissReturnSheet}
      />
    </View>
  )
}
