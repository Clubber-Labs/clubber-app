# Release Checklist

Pendências e configurações que precisam ser revisadas antes do primeiro build de produção (TestFlight / App Store / Play Store).

## iOS

### `aps-environment` — Debug vs Release

**Problema:** o entitlements gerado pelo `expo prebuild` (`ios/connectaimobile/connectaimobile.entitlements`) tem `aps-environment` hardcoded como `development`. O `CODE_SIGN_ENTITLEMENTS` aponta pro mesmo arquivo em ambas as configurações (Debug e Release), então builds de Release vão pra App Store/TestFlight com `development` em vez de `production` — push notifications vão falhar em produção.

**Fix idiomático:** uma das alternativas:

1. **Entitlements separados por configuração** — criar `connectaimobile.Debug.entitlements` e `connectaimobile.Release.entitlements`, configurar `CODE_SIGN_ENTITLEMENTS` com variável `$(CONFIGURATION)` no Xcode project settings.

2. **Build setting parametrizado** — definir `APS_ENVIRONMENT` como build setting (Debug=`development`, Release=`production`), e referenciar via `$(APS_ENVIRONMENT)` no entitlements.

3. **EAS Build hook** — investigar se o EAS Build já lida com isso automaticamente via post-install/credential setup. Caso afirmativo, não há nada a fazer no client.

**Antes de mexer:** confirmar com EAS Build se há mecanismo automático. Se sim, item resolvido. Se não, escolher entre opções 1 ou 2 e validar com primeiro build de produção.

**Apontado por:** code review do PR feat/explore-screen.

### Push Notifications — `expo-notifications` removido temporariamente

**Contexto:** o package `expo-notifications` foi removido porque o Apple Developer profile não tem Push Notifications capability registrada, e o config-plugin do package adicionava `aps-environment` automaticamente, quebrando builds em device físico (`Provisioning Profile does not support the Push Notifications capability`) e versionando um valor `development` indevido no entitlements.

**Quando reintegrar:**

1. Habilitar **Push Notifications** capability no Apple Developer Portal (`developer.apple.com` → Identifiers → `com.netobonato.connectaimobile` → Capabilities → Push Notifications)
2. Reinstalar package: `pnpm add expo-notifications`
3. Recriar `src/features/notifications/` (hook + service) — esqueleto antigo no histórico do git: `git show <hash>:src/features/notifications/hooks/usePushNotifications.ts`
4. Consumir `usePushNotifications` no layout autenticado (provavelmente `_layout.tsx` ou tab layout)
5. Rodar `npx expo prebuild --platform ios` pra regenerar entitlements com `aps-environment`
6. **Resolver o item acima** (`aps-environment` Debug vs Release) ANTES do primeiro build de produção, senão push falha em release

## Antes de cada release

- [ ] Bump `version` em `app.config.js`
- [ ] Verificar que todos os secrets estão configurados no EAS (`eas secret:list`)
- [ ] Confirmar `API_URL` apontando pra produção
- [ ] Rodar `npx tsc --noEmit` e `npm run lint` localmente
- [ ] Smoke test no simulador iOS e device físico Android
- [ ] Atribuição da Mapbox/OpenStreetMap acessível na tela "Sobre" (perfil → Sobre)
