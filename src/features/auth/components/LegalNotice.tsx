import { Text } from 'react-native'
import { Trans, useTranslation } from 'react-i18next'
import { openDocument } from '@/shared/lib/openDocument'

const TERMS_URL = 'https://clubber.social/termos'
const PRIVACY_URL = 'https://clubber.social/privacidade'

type Props = {
  /** Verbo da ação que o botão acima executa, já traduzido pelo caller. */
  action?: string
}

/**
 * Aceite dos documentos como texto legal sob o CTA — padrão de Instagram,
 * TikTok e Spotify. Não é checkbox, não é tela, não é modal: quem cria a conta
 * aceita ao criar, e o backend registra o aceite na transação do cadastro.
 *
 * Vale pros dois caminhos: senha e login social. Os links moram DENTRO da
 * frase traduzida (<terms>/<privacy> na chave), porque a ordem deles muda
 * entre idiomas — dividir a frase em pedaços no código quebraria isso.
 */
export function LegalNotice({ action }: Props) {
  const { t } = useTranslation()
  return (
    <Text className="text-content-subtle text-xs text-center leading-5 px-2">
      <Trans
        i18nKey="auth.legal.notice"
        values={{ action: action ?? t('auth.legal.actionCreate') }}
        components={{
          terms: (
            <Text
              className="text-content-muted underline"
              onPress={() => openDocument(TERMS_URL)}
            />
          ),
          privacy: (
            <Text
              className="text-content-muted underline"
              onPress={() => openDocument(PRIVACY_URL)}
            />
          ),
        }}
      />
    </Text>
  )
}
