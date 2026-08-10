import { useEffect, useRef } from 'react'
import { useNavigation } from 'expo-router'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'

// Mesmo shape do ParamListBase do react-navigation (pacote não hoisted).
type ParamListBase = Record<string, object | undefined>

// Dispara no re-tap da aba JÁ ativa (padrão de plataforma: voltar ao topo /
// atualizar). Tap que troca de aba não dispara — isFocused ainda é false no
// momento do tabPress. Fora de uma tab (ex.: componente reusado em stack) o
// evento nunca é emitido e o hook é inerte.
export function useActiveTabPress(handler: () => void) {
  const navigation = useNavigation<BottomTabNavigationProp<ParamListBase>>()
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    return navigation.addListener('tabPress', () => {
      if (navigation.isFocused()) handlerRef.current()
    })
  }, [navigation])
}
