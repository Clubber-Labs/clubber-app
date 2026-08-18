import { Text } from 'react-native'
import { openDocument } from '@/shared/lib/openDocument'

const TERMS_URL = 'https://clubber.social/termos'
const PRIVACY_URL = 'https://clubber.social/privacidade'

type Props = {
  /** Verbo da ação que o botão acima executa. */
  action?: string
}

/**
 * Aceite dos documentos como texto legal sob o CTA — padrão de Instagram,
 * TikTok e Spotify. Não é checkbox, não é tela, não é modal: quem cria a conta
 * aceita ao criar, e o backend registra o aceite na transação do cadastro.
 *
 * Vale pros dois caminhos: senha e login social.
 */
export function LegalNotice({ action = 'criar sua conta' }: Props) {
  return (
    <Text className="text-content-subtle text-xs text-center leading-5 px-2">
      Ao {action}, você concorda com os{' '}
      <Text
        className="text-content-muted underline"
        onPress={() => openDocument(TERMS_URL)}
      >
        Termos de Uso
      </Text>{' '}
      e com a{' '}
      <Text
        className="text-content-muted underline"
        onPress={() => openDocument(PRIVACY_URL)}
      >
        Política de Privacidade
      </Text>
      .
    </Text>
  )
}
