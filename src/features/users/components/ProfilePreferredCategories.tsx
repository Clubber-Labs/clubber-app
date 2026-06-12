import { View, Text } from 'react-native'
import { useCategories } from '@/shared/hooks/useCategories'

type Props = {
  values: string[]
}

// Exibição read-only das categorias preferidas no perfil. Rótulos vêm de
// /categories via useCategories; guarda o value e exibe o label.
export function ProfilePreferredCategories({ values }: Props) {
  const { labelFor } = useCategories()

  if (values.length === 0) return null

  return (
    <View className="flex-row flex-wrap justify-center gap-1.5 mt-3">
      {values.map(value => (
        <View key={value} className="bg-violet-950 px-2.5 py-1 rounded-full">
          <Text className="text-violet-300 text-xs font-medium">
            {labelFor(value)}
          </Text>
        </View>
      ))}
    </View>
  )
}
