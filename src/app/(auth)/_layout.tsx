import { Stack } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function AuthLayout() {
  const insets = useSafeAreaInsets()
  // Inset do topo POR TELA (contentStyle), não no SafeAreaView raiz: o
  // onboarding é edge-to-edge (mapa sob a status bar) e alternar os edges
  // globais na navegação re-layoutava a árvore inteira — todos os elementos
  // "flickavam" verticalmente ao entrar/sair dele. Com o padding por tela,
  // cada rota nasce com o próprio inset desde o primeiro frame.
  const inset = { contentStyle: { paddingTop: insets.top } }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" options={inset} />
      <Stack.Screen name="register" options={inset} />
      <Stack.Screen name="forgot-password" options={inset} />
      <Stack.Screen
        name="consent"
        options={{ gestureEnabled: false, ...inset }}
      />
      <Stack.Screen
        name="complete-profile"
        options={{ gestureEnabled: false, ...inset }}
      />
    </Stack>
  )
}
