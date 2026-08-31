import { useCallback } from 'react'
import { Linking } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { useBanner } from '@/shared/lib/banner'
import { useLocationGate } from './useLocationGate'

/**
 * Caminho ÚNICO pra pedir acesso à localização — mapa, feed e quem mais
 * precisar entram por aqui. Antes cada tela tinha seu próprio pedido e o fluxo
 * ficava impossível de prever.
 *
 * Sem banner nos casos que LEVAM a algum lugar: os ajustes abrindo e a tela de
 * privacidade (que mostra o estado revogado no topo) já são a resposta — texto
 * ali seria o terceiro aviso sobre a mesma coisa.
 */
export function useRequestLocationAccess() {
  const { status, grant } = useLocationGate()
  const router = useRouter()
  const showBanner = useBanner()
  const { t } = useTranslation()

  return useCallback(async () => {
    if (status === 'denied') {
      Linking.openSettings()
      return
    }
    if (status === 'revoked') {
      // Revogação se desfaz no app, não nos ajustes do sistema — mandar pra lá
      // faria a pessoa ativar a permissão e continuar sem ver nada.
      router.push('/profile/privacy')
      return
    }
    const result = await grant()
    if (result === 'denied') {
      Linking.openSettings()
    } else if (result === 'error') {
      // Único caso sem destino: aqui o texto é o feedback que existe.
      showBanner(t('privacy.locationError'))
    }
  }, [status, grant, router, showBanner, t])
}
