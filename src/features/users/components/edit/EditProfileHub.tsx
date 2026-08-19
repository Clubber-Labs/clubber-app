import type { ReactNode } from 'react'
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import {
  CaretLeftIcon,
  CameraIcon,
  CaretRightIcon,
} from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { useRouter } from 'expo-router'
import { useMyProfile, useUploadAvatar } from '../../hooks/useProfile'
import { usePickAvatar } from '../../hooks/usePickAvatar'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { useCategories } from '@/shared/hooks/useCategories'
import { formatPhone } from '@/shared/utils/masks'
import { formatDayMonthYear } from '@/shared/utils/dateFormat'
import { useLocale } from '@/shared/hooks/useLocale'
import { colors } from '@/shared/theme'

// Hub de edição: só navega e mostra o valor atual de cada campo. Cada linha
// abre uma tela focada que salva o seu campo. O avatar é a única edição inline.
export function EditProfileHub() {
  const { t } = useTranslation()
  const locale = useLocale()
  const router = useRouter()
  const { data: profile, isLoading } = useMyProfile()
  const uploadAvatar = useUploadAvatar()
  const { labelFor } = useCategories()
  const handlePickAvatar = usePickAvatar(uri => uploadAvatar.mutate(uri))

  if (isLoading || !profile) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={colors.brand} />
      </View>
    )
  }

  const fullName = `${profile.name} ${profile.lastname}`.trim()

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 px-3 pt-2 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-surface-elevated items-center justify-center"
          accessibilityLabel={t('common.back')}
        >
          <CaretLeftIcon size={22} color={colors.contentSecondary} />
        </Pressable>
        <Text className="flex-1 text-content text-lg font-extrabold">
          {t('profile.edit.title')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center pt-3 pb-2 gap-2.5">
          <Pressable
            onPress={handlePickAvatar}
            disabled={uploadAvatar.isPending}
            accessibilityLabel={t('profile.edit.changePhotoLabel')}
          >
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                overflow: 'hidden',
              }}
            >
              <UserAvatar
                name={fullName}
                avatarUrl={profile.avatarUrl}
                size={96}
              />
              {uploadAvatar.isPending && (
                <View className="absolute inset-0 bg-background/60 items-center justify-center">
                  <ActivityIndicator color={colors.content} />
                </View>
              )}
            </View>
            <View className="absolute right-[-2px] bottom-[-2px] w-8 h-8 rounded-full bg-brand border-[3px] border-background items-center justify-center">
              <CameraIcon size={15} color={colors.content} />
            </View>
          </Pressable>
          <Pressable
            onPress={handlePickAvatar}
            disabled={uploadAvatar.isPending}
          >
            <Text className="text-brand-text text-[13px] font-bold">
              {t('profile.edit.changePhoto')}
            </Text>
          </Pressable>
        </View>

        <View className="px-4">
          <Group label={t('profile.edit.groupPublic')}>
            <Row
              first
              label={t('profile.edit.name')}
              value={profile.name}
              onPress={() => router.push('/profile/edit/name')}
            />
            <Row
              label={t('profile.edit.lastname')}
              value={profile.lastname}
              onPress={() => router.push('/profile/edit/lastname')}
            />
            <Row
              label={t('profile.edit.username')}
              value={`@${profile.username}`}
              onPress={() => router.push('/profile/edit/username')}
            />
            <Row
              label={t('profile.edit.bio')}
              value={profile.bio ?? ''}
              placeholder={t('profile.edit.addBio')}
              onPress={() => router.push('/profile/edit/bio')}
            />
          </Group>

          <Group label={t('profile.edit.groupPreferences')}>
            <Row
              first
              label={t('profile.edit.categories')}
              value={summarize(profile.preferredCategories, labelFor, t)}
              placeholder={t('profile.edit.choose')}
              onPress={() => router.push('/profile/edit/categories')}
            />
            <Row
              label={t('profile.edit.interests')}
              value={summarize(profile.preferredSubcategories, labelFor, t)}
              placeholder={t('profile.edit.add')}
              onPress={() => router.push('/profile/edit/interests')}
            />
          </Group>

          <Group label={t('profile.edit.groupAccount')}>
            <Row
              first
              label={t('profile.edit.phone')}
              value={profile.phone ? formatPhone(profile.phone) : ''}
              placeholder={t('profile.edit.add')}
              onPress={() => router.push('/profile/edit/phone')}
            />
            <Row
              label={t('profile.edit.birthdate')}
              value={
                profile.birthdate
                  ? formatDayMonthYear(profile.birthdate, locale)
                  : ''
              }
              placeholder={t('profile.edit.add')}
              onPress={() => router.push('/profile/edit/birthdate')}
            />
          </Group>

          <Group label={t('profile.edit.groupPrivacy')}>
            <Row
              first
              label={t('profile.edit.visibility')}
              value={
                profile.isPrivate
                  ? t('profile.edit.private')
                  : t('profile.edit.public')
              }
              onPress={() => router.push('/profile/edit/privacy')}
            />
          </Group>
        </View>
      </ScrollView>
    </View>
  )
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <Text className="text-content-subtle text-[11px] font-extrabold uppercase tracking-widest mt-5 mb-3">
        {label}
      </Text>
      <View className="bg-surface border border-line rounded-2xl overflow-hidden">
        {children}
      </View>
    </>
  )
}

function Row({
  label,
  value,
  placeholder,
  onPress,
  first,
}: {
  label: string
  value: string
  placeholder?: string
  onPress: () => void
  first?: boolean
}) {
  const empty = value.length === 0
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-2.5 px-3.5 py-3 active:bg-surface-elevated ${
        first ? '' : 'border-t border-line'
      }`}
    >
      <Text className="text-content-secondary text-[15px] font-semibold">
        {label}
      </Text>
      <Text
        numberOfLines={1}
        className={`flex-1 text-right text-[13.5px] ${
          empty ? 'text-content-faint' : 'text-content-muted'
        }`}
      >
        {empty ? (placeholder ?? '') : value}
      </Text>
      <CaretRightIcon size={18} color={colors.contentFaint} />
    </Pressable>
  )
}

function summarize(
  values: string[] | undefined,
  labelFor: (value: string) => string,
  t: TFunction,
): string {
  if (!values || values.length === 0) return ''
  const shown = values.slice(0, 2).map(labelFor)
  const extra = values.length - shown.length
  return extra > 0
    ? t('profile.edit.summaryExtra', { list: shown.join(', '), count: extra })
    : shown.join(', ')
}
