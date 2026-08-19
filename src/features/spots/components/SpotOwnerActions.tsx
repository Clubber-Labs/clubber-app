import { View, Text } from 'react-native'
import {
  ClockIcon,
  ArrowsClockwiseIcon,
  PencilSimpleIcon,
  TrashIcon,
} from 'phosphor-react-native'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { FormError } from '@/shared/components/FormError'
import { SpotActionRow } from './SpotActionRow'
import { colors } from '@/shared/theme'

type Props = {
  // Veio do deep-link "seu rolê está acabando" — Renovar vira o CTA primário.
  highlightRenew: boolean
  onRenew: () => void
  onEdit: () => void
  onCancel: () => void
  renewing: boolean
  canceling: boolean
  renewError: string | null
}

// Ações de dono do rolê, separadas do corpo: lista estilo "ajustes" (Renovar ·
// Editar · Cancelar). Quando o rolê está expirando (deep-link da notificação),
// Renovar sobe como botão primário acima da lista — a urgência fura o padrão.
export function SpotOwnerActions({
  highlightRenew,
  onRenew,
  onEdit,
  onCancel,
  renewing,
  canceling,
  renewError,
}: Props) {
  const { t } = useTranslation()
  return (
    <View className="border-t border-line pt-4 gap-3">
      <Text className="text-content-subtle text-[11px] font-bold uppercase tracking-wider">
        {t('spots.owner.manage')}
      </Text>

      {highlightRenew && (
        <View className="gap-2">
          <View className="flex-row items-start gap-2 bg-brand-surface border border-brand-surface-strong rounded-xl px-3 py-2.5">
            <ClockIcon
              size={16}
              color={colors.brandText}
              style={{ marginTop: 1 }}
            />
            <Text className="text-brand-text-strong text-xs flex-1 leading-5">
              {t('spots.owner.endingSoon')}
            </Text>
          </View>
          <Button
            label={t('spots.owner.renew')}
            icon={ArrowsClockwiseIcon}
            onPress={onRenew}
            loading={renewing}
          />
          <FormError message={renewError} />
        </View>
      )}

      <View className="bg-surface border border-line rounded-2xl overflow-hidden">
        {!highlightRenew && (
          <>
            <SpotActionRow
              icon={ArrowsClockwiseIcon}
              label={t('spots.owner.renew')}
              sublabel={t('spots.owner.renewSub')}
              onPress={onRenew}
              loading={renewing}
            />
            <View className="h-px bg-line mx-4" />
          </>
        )}
        <SpotActionRow
          icon={PencilSimpleIcon}
          label={t('spots.owner.edit')}
          sublabel={t('spots.owner.editSub')}
          onPress={onEdit}
        />
        <View className="h-px bg-line mx-4" />
        <SpotActionRow
          icon={TrashIcon}
          label={t('spots.owner.cancel')}
          sublabel={t('spots.owner.cancelSub')}
          onPress={onCancel}
          loading={canceling}
          destructive
        />
      </View>

      {!highlightRenew && <FormError message={renewError} />}
    </View>
  )
}
