import { Text } from 'react-native'

export function SenderLabel({ name }: { name: string }) {
  return (
    <Text className="text-[12px] font-semibold text-violet-300 ml-1 mb-0.5">
      {name}
    </Text>
  )
}
