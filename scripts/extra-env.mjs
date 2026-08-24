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
}
