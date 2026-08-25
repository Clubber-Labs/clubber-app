import { useCallback, useEffect, useRef } from 'react'
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useInvite } from '@/features/invites/hooks/useInvite'
import { useAcceptInvite } from '@/features/invites/hooks/useAcceptInvite'
import { Button } from '@/shared/components/Button'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { useBanner } from '@/shared/lib/banner'
import { getApiError, isNotFoundError } from '@/shared/lib/apiError'
import {
  deletePendingInviteToken,
  getPendingInviteToken,
  savePendingInviteToken,
} from '@/shared/lib/secureStore'
import { useLocale } from '@/shared/hooks/useLocale'
import { formatDayOfMonthAtTime } from '@/shared/utils/dateFormat'
import { formatFullName } from '@/shared/utils/fullName'
import { colors } from '@/shared/theme'

type InviteErrorKind =
  | 'notFound'
  | 'expired'
  | 'revoked'
  | 'canceled'
  | 'network'
  | 'generic'

// Códigos do contrato de convite → copy da tela. O backend não distingue link
// inexistente de viewer bloqueado (ambos 404) — a UI também não deve.
const ERROR_KIND_BY_CODE: Record<string, InviteErrorKind> = {
  INVITE_LINK_NOT_FOUND: 'notFound',
  INVITE_LINK_EXPIRED: 'expired',
  INVITE_LINK_REVOKED: 'revoked',
  EVENT_CANCELED: 'canceled',
  NETWORK_ERROR: 'network',
}

function inviteErrorKind(error: unknown): InviteErrorKind {
  const { code } = getApiError(error)
  if (ERROR_KIND_BY_CODE[code]) return ERROR_KIND_BY_CODE[code]
  return isNotFoundError(error) ? 'notFound' : 'generic'
}

// Erro que encerra o fluxo (troca a tela inteira). Rede/genérico no ACEITE não
// derruba o card carregado — vira banner e o usuário retenta no botão.
function blockingErrorKind(
  loadError: unknown,
  acceptError: unknown,
): InviteErrorKind | null {
  if (loadError) return inviteErrorKind(loadError)
  if (!acceptError) return null
  const kind = inviteErrorKind(acceptError)
  return kind === 'network' || kind === 'generic' ? null : kind
}

export default function InviteScreen() {
  const { t } = useTranslation()
  const locale = useLocale()
  const { token } = useLocalSearchParams<{ token: string }>()
  const router = useRouter()
  const showBanner = useBanner()
  const status = useAuthStore(s => s.status)
  const { data: invite, isLoading, error, refetch } = useInvite(token ?? '')
  const accept = useAcceptInvite(token ?? '')
  const { mutate: acceptMutate } = accept

  const acceptInvite = useCallback(() => {
    acceptMutate(undefined, {
      onSuccess: ({ eventId }) => router.replace(`/events/${eventId}`),
      onError: err => {
        const kind = inviteErrorKind(err)
        if (kind === 'network' || kind === 'generic') {
          showBanner(getApiError(err).message)
        }
      },
    })
  }, [acceptMutate, router, showBanner])

  // Retomada pós-login: o AuthGuard volta pra cá com o token pendente ainda no
  // storage; consumir = limpar SEMPRE (mesmo com o link morto no meio-tempo) e
  // aceitar se o preview carregou — o accept é idempotente, então quem já tem
  // acesso também cai direto no evento.
  const resumed = useRef(false)
  useEffect(() => {
    if (status !== 'authenticated' || resumed.current) return
    if (!invite && !error) return
    resumed.current = true
    getPendingInviteToken().then(pending => {
      if (!pending || pending !== token) return
      deletePendingInviteToken()
      if (invite) acceptInvite()
    })
  }, [status, invite, error, token, acceptInvite])

  async function goToLogin() {
    if (!token) return
    try {
      await savePendingInviteToken(token)
    } catch {
      // Sem storage o accept não retoma sozinho, mas o login segue possível.
    }
    router.push('/(auth)/login')
  }

  const blockingKind = blockingErrorKind(error, accept.error)

  if (blockingKind) {
    const retriable = blockingKind === 'network' || blockingKind === 'generic'
    return (
      <View className="flex-1 bg-background items-center justify-center px-8 gap-3">
        <Text className="text-content font-semibold text-lg text-center">
          {t(`invites.errors.${blockingKind}Title`)}
        </Text>
        <Text className="text-content-muted text-sm text-center">
          {t(`invites.errors.${blockingKind}Body`)}
        </Text>
        {retriable ? (
          <Pressable onPress={() => refetch()} hitSlop={8}>
            <Text className="text-brand-text font-semibold mt-2">
              {t('common.retry')}
            </Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => router.replace('/(tabs)/map')} hitSlop={8}>
            <Text className="text-brand-text font-semibold mt-2">
              {t('invites.errors.goToApp')}
            </Text>
          </Pressable>
        )}
      </View>
    )
  }

  if (isLoading || !invite) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.brandEmphasis} />
      </View>
    )
  }

  const { event } = invite
  const authorName = formatFullName(event.author.name, event.author.lastname)
  const isGuest = status !== 'authenticated'

  return (
    <View className="flex-1 bg-background px-6 pt-6 pb-10">
      <Text className="text-content text-2xl font-bold">
        {t('invites.landing.heading', { name: event.author.name })}
      </Text>

      <View className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
        <View className="h-48 w-full bg-surface-elevated">
          {event.coverUrl ? (
            <Image
              source={{ uri: event.coverUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Svg style={StyleSheet.absoluteFill}>
              <Defs>
                <RadialGradient id="invite-cover-grad" cx="0" cy="0" r="1">
                  <Stop offset="0" stopColor={colors.brandSurfaceStrong} />
                  <Stop offset="0.7" stopColor={colors.surface} />
                </RadialGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#invite-cover-grad)"
              />
            </Svg>
          )}
        </View>
        <View className="gap-2 p-4">
          <Text className="text-content text-xl font-bold">{event.title}</Text>
          <Text className="text-content-secondary text-sm">
            {formatDayOfMonthAtTime(event.date, locale, event.timezone)}
          </Text>
          {!!event.description && (
            <Text className="text-content-muted text-sm" numberOfLines={3}>
              {event.description}
            </Text>
          )}
          <View className="mt-1 flex-row items-center gap-2">
            <UserAvatar
              name={event.author.name}
              avatarUrl={event.author.avatarUrl}
              size={28}
            />
            <View className="shrink">
              <Text
                className="text-content-secondary text-sm font-semibold"
                numberOfLines={1}
              >
                {t('invites.landing.by', { name: authorName })}
              </Text>
              <Text className="text-content-muted text-xs" numberOfLines={1}>
                @{event.author.username}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="flex-1" />

      {invite.viewer.hasAccess ? (
        <Button
          label={t('invites.landing.view')}
          size="lg"
          onPress={() => router.replace(`/events/${event.id}`)}
        />
      ) : isGuest ? (
        <View className="gap-3">
          <Text className="text-content-muted text-sm text-center">
            {t('invites.landing.loginHint')}
          </Text>
          <Button
            label={t('invites.landing.loginCta')}
            size="lg"
            onPress={goToLogin}
          />
        </View>
      ) : (
        <Button
          label={t('invites.landing.accept')}
          size="lg"
          loading={accept.isPending}
          onPress={acceptInvite}
        />
      )}
    </View>
  )
}
