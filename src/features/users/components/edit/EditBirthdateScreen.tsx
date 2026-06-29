import { useMemo, useState } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { EditFieldScaffold } from './EditFieldScaffold'
import { useEditProfileField } from '../../hooks/useEditProfileField'
import { WheelDatePicker } from '@/shared/components/WheelDatePicker'
import { parseLocalDate, toLocalIsoDate } from '@/shared/utils/dateFormat'
import type { UserProfile } from '@/shared/types'
import { colors } from '@/shared/theme'

const DEFAULT_BIRTHDATE = new Date(2000, 0, 1)
const MIN_BIRTHDATE = new Date(1920, 0, 1)

export function EditBirthdateScreen() {
  const { profile, save, saving } = useEditProfileField()

  if (!profile) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={colors.brand} />
      </View>
    )
  }

  return <BirthdateForm profile={profile} save={save} saving={saving} />
}

type FormProps = {
  profile: UserProfile
  save: (patch: { birthdate: string }) => void
  saving: boolean
}

function BirthdateForm({ profile, save, saving }: FormProps) {
  const initial = profile.birthdate ? profile.birthdate.split('T')[0] : ''
  const [date, setDate] = useState<Date>(
    profile.birthdate ? parseLocalDate(profile.birthdate) : DEFAULT_BIRTHDATE,
  )
  const today = useMemo(() => new Date(), [])

  const next = toLocalIsoDate(date)
  const canSave = next !== initial

  return (
    <EditFieldScaffold
      title="Nascimento"
      onSave={() => save({ birthdate: next })}
      saving={saving}
      canSave={canSave}
    >
      <Text className="text-content-muted text-[12.5px] leading-5 mb-6">
        Sua idade confirma que você pode usar o Clubber. Não aparece no seu
        perfil.
      </Text>

      <WheelDatePicker
        value={date}
        onChange={setDate}
        minimumDate={MIN_BIRTHDATE}
        maximumDate={today}
      />

      <Text className="text-content-secondary text-center text-[15px] font-semibold mt-6">
        {date.toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </Text>
    </EditFieldScaffold>
  )
}
