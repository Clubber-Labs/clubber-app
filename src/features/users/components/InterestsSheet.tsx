import { useEffect, useMemo, useState } from 'react'
import { View, Text, ScrollView, useWindowDimensions } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SheetModal } from '@/shared/components/SheetModal'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { useCategories } from '@/shared/hooks/useCategories'
import { useBanner } from '@/shared/lib/banner'
import { getApiError } from '@/shared/lib/apiError'
import { MIN_PREFERRED_CATEGORIES } from '@/shared/utils/rolePreferences'
import { InterestToggleChip } from './InterestToggleChip'
import { useUpdateInterests } from '../hooks/useUpdateInterests'
import type { UserProfile } from '@/shared/types'

type Props = {
  visible: boolean
  onClose: () => void
  profile: UserProfile
}

// Teto do perfil: cena + som + lugares somados.
const MAX_INTERESTS = 10

type Option = { value: string; label: string }

function toggled(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter(v => v !== value) : [...list, value]
}

function sameSet(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every(v => b.includes(v))
}

/**
 * Folha de interesses do dono do perfil. CENA são as categorias de rolê
 * (preferredCategories); SOM os gêneros e LUGARES as subcategorias de venue —
 * os dois últimos moram juntos em preferredSubcategories, como no backend.
 * Fecha no Salvar com otimismo; se o PUT falhar os chips voltam e o banner
 * avisa.
 */
export function InterestsSheet({ visible, onClose, profile }: Props) {
  const { t } = useTranslation()
  const { height } = useWindowDimensions()
  const { categories, genres } = useCategories()
  const showBanner = useBanner()
  const update = useUpdateInterests(profile.id)
  const initialCategories = profile.preferredCategories ?? []
  const initialInterests = profile.preferredSubcategories ?? []
  const [scene, setScene] = useState<string[]>(initialCategories)
  const [interests, setInterests] = useState<string[]>(initialInterests)

  // Reabrir parte do que está salvo, não do rascunho abandonado.
  useEffect(() => {
    if (!visible) return
    setScene(profile.preferredCategories ?? [])
    setInterests(profile.preferredSubcategories ?? [])
  }, [visible, profile.preferredCategories, profile.preferredSubcategories])

  const sceneOptions: Option[] = categories
  const soundOptions: Option[] = genres
  const placeOptions: Option[] = useMemo(
    () => categories.flatMap(category => category.subcategories ?? []),
    [categories],
  )

  const total = scene.length + interests.length
  const atMax = total >= MAX_INTERESTS
  const belowMin = scene.length < MIN_PREFERRED_CATEGORIES
  const changed =
    !sameSet(scene, initialCategories) || !sameSet(interests, initialInterests)

  function save() {
    update.mutate(
      { preferredCategories: scene, preferredSubcategories: interests },
      { onError: e => showBanner(getApiError(e).message) },
    )
    onClose()
  }

  const groups = [
    {
      key: 'scene',
      title: t('profile.interests.groups.scene'),
      options: sceneOptions,
      selected: scene,
      toggle: (value: string) => setScene(prev => toggled(prev, value)),
    },
    {
      key: 'sound',
      title: t('profile.interests.groups.sound'),
      options: soundOptions,
      selected: interests,
      toggle: (value: string) => setInterests(prev => toggled(prev, value)),
    },
    {
      key: 'places',
      title: t('profile.interests.groups.places'),
      options: placeOptions,
      selected: interests,
      toggle: (value: string) => setInterests(prev => toggled(prev, value)),
    },
  ]

  return (
    <SheetModal
      visible={visible}
      onClose={onClose}
      height={Math.round(height * 0.82)}
    >
      <View className="flex-1 px-5">
        <View className="flex-row items-baseline justify-between">
          <Text className="text-[17px] font-extrabold text-content">
            {t('profile.interests.title')}
          </Text>
          <Text className="text-xs text-content-muted">
            {t('profile.preferences.countOfMax', { count: total })}
          </Text>
        </View>
        <Text className="mt-1 text-[13px] text-content-muted">
          {t('profile.interests.subtitle')}
        </Text>

        <ScrollView
          className="mt-4 flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 20, paddingBottom: 16 }}
        >
          {groups.map(group =>
            group.options.length === 0 ? null : (
              <View key={group.key} className="gap-2.5">
                <Text
                  className="text-[10px] font-bold uppercase text-content-subtle"
                  style={{ letterSpacing: 1.5 }}
                >
                  {group.title}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {group.options.map(option => {
                    const active = group.selected.includes(option.value)
                    return (
                      <InterestToggleChip
                        key={option.value}
                        label={option.label}
                        active={active}
                        disabled={!active && atMax}
                        onPress={() => group.toggle(option.value)}
                      />
                    )
                  })}
                </View>
              </View>
            ),
          )}
        </ScrollView>

        <View className="gap-3 pt-2">
          {belowMin && <FormError message={t('auth.errors.categoriesMin')} />}
          <Button
            label={t('common.save')}
            onPress={save}
            disabled={!changed || belowMin}
          />
        </View>
      </View>
    </SheetModal>
  )
}
