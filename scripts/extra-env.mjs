// Variáveis de ambiente que viram `expo.extra` — de onde o app as lê em runtime
// (Constants.expoConfig.extra). Ficam aqui, e não inline no app.config.js,
// porque têm DOIS consumidores que precisam concordar:
//
//   - app.config.js, que monta o objeto `extra`
//   - scripts/publish-update.mjs, que recusa publicar uma update sem elas
//
// Divergir é armadilha silenciosa: sem a variável, o valor sai `undefined` e
// simplesmente desaparece do manifesto. O export não reclama, o publish não
// reclama — quem descobre é o aparelho que baixa a update. Sem `apiUrl` o app
// fica sem backend (tela "Sem conexão"); sem os client ids, o login social
// quebra. Aconteceu em 23/08/2026, ver docs/eas-update.md.
//
// Mesmo espírito do scripts/splash-spec.mjs.
export const EXTRA_FROM_ENV = {
  apiUrl: 'API_URL',
  mapboxAccessToken: 'MAPBOX_ACCESS_TOKEN',
  googleWebClientId: 'GOOGLE_WEB_CLIENT_ID',
  googleIosClientId: 'GOOGLE_IOS_CLIENT_ID',
  // Chave PÚBLICA do Stripe (pk_test_/pk_live_) — PaymentSheet nativa.
  // A secret key NUNCA entra no app; tudo sensível passa pelo backend.
  stripePublishableKey: 'STRIPE_PUBLISHABLE_KEY',
  // App ID do app da Meta — identifica quem mandou o conteúdo no intent de
  // Stories do Instagram (`source_application`). Público (vai no binário); o
  // APP SECRET nunca entra aqui. É o MESMO app que o login social usa: o valor
  // é idêntico ao FACEBOOK_APP_ID do backend, e o nome é igual de propósito
  // pra ninguém registrar um segundo app na Meta achando que são coisas
  // diferentes. Ausente, a opção "Stories" some da folha de compartilhar.
  facebookAppId: 'FACEBOOK_APP_ID',
  // Client ID do Spotify — público por natureza (vai na URL de autorização).
  // O client secret NUNCA entra no app: quem troca o code por token é o
  // backend, e é só por isso que o PKCE daqui é seguro.
  spotifyClientId: 'SPOTIFY_CLIENT_ID',
}

/**
 * Variáveis cuja AUSÊNCIA é o estado esperado — o portão do publish não pode
 * barrar por elas.
 *
 * SPOTIFY_CLIENT_ID é o interruptor da integração dormente (ver CLAUDE.md e
 * docs/integracao-spotify.md): sem ela todo o UI de vínculo some sozinho, e é
 * assim que os builds de produção e preview saem. Exigi-la aqui empurra quem
 * publica a defini-la só pra destravar o portão — reacendendo, numa OTA e sem
 * passar por build, uma feature que o Spotify não libera pra apps novos.
 *
 * De quebra, definir a variável muda o app.config.js e portanto o fingerprint:
 * a runtime version passaria a ser outra e a update simplesmente nunca chegaria
 * nos binários que já estão instalados, sem erro nenhum.
 */
export const OPTIONAL_EXTRA_ENV = new Set(['SPOTIFY_CLIENT_ID'])
