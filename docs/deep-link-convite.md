# Deep link de convite de eventos

Estado em 2026-08-25 (branch `feat/deep-link-convite`). O fluxo completo é:
autor gera o link no detalhe do evento → `https://clubber.social/e/<token>` →
app abre a tela do convite (logado ou não) → aceite (retomado após login se
preciso) → evento aberto.

## O que já está pronto

### Mobile (este repo)

- `app.config.js`: `ios.associatedDomains` (`applinks:clubber.social`) e
  `android.intentFilters` (`autoVerify`, `https://clubber.social/e/*`).
  **Mudança nativa** — exige `prebuild` + build novo; OTA não entrega
  entitlement nem intent filter.
- Rotas: `app/invites/[token].tsx` (tela real, funciona deslogada) e
  `app/e/[token].tsx` (espelho do path público, só redireciona).
- `AuthGuard` (`app/_layout.tsx`): exceção pra rota do convite deslogada e
  retomada pós-login — o token pendente fica em `pending_invite_token` no
  SecureStore e é **sempre limpo ao consumir**. Nunca logar o token.
- `EventShareButton`: gera o link via `POST /events/:id/invite-links` e
  compartilha a `url` retornada (o client nunca monta URL de convite). O
  endpoint é author-only, então o botão só é montado pro autor.
- Erros mapeados na tela: `INVITE_LINK_NOT_FOUND` (404, também cobre viewer
  bloqueado — não diferenciar), `INVITE_LINK_EXPIRED`, `INVITE_LINK_REVOKED`,
  `EVENT_CANCELED` (410), rede e genérico.

### Backend (connectai-backend, módulo `share`)

Já serve tudo que o domínio precisa:

- `GET /.well-known/apple-app-site-association` (AASA)
- `GET /.well-known/assetlinks.json`
- `GET /e/<token>` — landing web de fallback pra quem não tem o app (botões de
  loja + fallback `clubber://invites/<token>`), com `cache-control: no-store`
  pra revogação ter efeito imediato também na web.

Defaults do `env.ts` já corretos: team `K238P4B9K4`, bundle/package
`com.netobonato.clubber`, fingerprint Android (CSV, aceita múltiplos).

## Pendências (infra — nada de código)

### 0. Deploy do backend com o módulo `share`

**Por quê:** verificado em 2026-08-25 — `api.clubber.social` é a API de
produção (`/health` 200), mas `GET /.well-known/apple-app-site-association`
devolve o 404 de "rota não registrada" do Fastify e `/e/<token>` devolve 404
JSON em vez da landing HTML. Ou seja, o código do módulo `share` (e dos
invite-links) **ainda não está em produção**.

O que fazer: fazer o deploy do connectai-backend com os PRs de invite-link e o
módulo `share` incluídos (e conferir que o módulo está registrado no app).
Verificação: `curl https://api.clubber.social/.well-known/apple-app-site-association`
deve voltar 200 JSON com o appID, e `/e/tokenqualquer` deve voltar 404 **HTML**
(a landing de indisponível), não JSON.

### 1. Rotear `/e/*` e `/.well-known/*` do domínio até a API

**Por quê:** o universal link (iOS) e o App Link (Android) só abrem o app se o
SO conseguir baixar o AASA/assetlinks **do domínio exato do link**
(`clubber.social`, não `api.clubber.social`). DNS e TLS **já existem**
(domínio na Cloudflare, cert válido), e o domínio já hospeda o site
institucional (Next.js) — então NÃO dá pra apontar o domínio inteiro pra API:
é rotear só esses dois prefixos.

**Aplicado em 2026-08-25** via `rewrites()` no `next.config.ts` do
clubber-institucional (branch `feat/deep-link-convite`): `/e/:token` e os dois
arquivos do `.well-known` (mapeados nominalmente) proxiam pra
`https://api.clubber.social`. Validado com `next start` local: os paths
proxiam até a API de produção e a home segue intacta. Falta commitar/mergear
e o deploy do site.

Pós-deploy, conferir na Cloudflare que `/e/*` não está sendo cacheado
(`cf-cache-status` deve respeitar o `no-store` que o backend manda; se
aparecer HIT ali, criar Cache Rule de bypass pros dois prefixos).

**Nunca redirect** (301/302/308): a Apple baixa o AASA por CDN próprio e não
segue redirect — o link quebra silenciosamente. Tem que ser resposta 200
servida sob `clubber.social`. Pelo mesmo motivo, cuidado com regras globais
de www/trailing-slash no site.

### 2. `SHARE_BASE_URL` no env de produção do backend

**Por quê:** é essa variável que entra na `url` devolvida pelo
`POST /events/:id/invite-links` — ou seja, no link que o autor compartilha.
Sem ela, o backend cai no fallback `PUBLIC_URL` e os convites saem com o
domínio da API (ex.: `https://api.../e/...`), que não casa com o
`associatedDomains`/`intentFilter` do app e nunca abre por universal link.

O que fazer: setar `SHARE_BASE_URL=https://clubber.social` onde o backend de
produção lê env (arquivo `.env` do deploy, secrets manager, painel do host) e
reiniciar o serviço. Conferir com um `POST /events/:id/invite-links` real que
a `url` retornada começa com `https://clubber.social/e/`.

### 3. `APP_STORE_URL` (depois da publicação iOS)

**Por quê:** a landing web de fallback (quem clica sem ter o app) só mostra o
botão "Baixar na App Store" se essa env existir — a URL precisa do id numérico
que a loja gera na publicação, impossível de adivinhar antes.

O que fazer: quando o app estiver na App Store, copiar a URL da ficha
(`https://apps.apple.com/br/app/clubber/id<numérico>`) e setar
`APP_STORE_URL` no env de produção do backend. O botão do Android já funciona
(`PLAY_STORE_URL` tem default com o package).

### 4. Fingerprint do Play App Signing no `assetlinks.json`

**Por quê:** build distribuído pela Play Store é **reassinado pelo Google**
com a chave do Play App Signing — outra chave, outro fingerprint. O Android
verifica o App Link comparando o certificado do APK instalado com o
`assetlinks.json`; sem o fingerprint da loja, o link funciona em build interno
(EAS) e quebra silenciosamente pra quem instalou pela Play Store.

O que fazer: Play Console → app Clubber → **Setup → App signing** → copiar o
**SHA-256 do "App signing key certificate"** e adicioná-lo ao
`ANDROID_CERT_SHA256` do backend. A env é CSV justamente pra isso:
**adicionar** o novo fingerprint mantendo o atual (do build EAS) — os dois
assinam apps legítimos e os dois devem abrir o link.

## Gotchas de validação

- O iOS baixa/revalida o AASA **na instalação do app**. Publicou o arquivo no
  domínio? Reinstale o app antes de testar o link `https://`.
- A primeira build com o entitlement exigiu registrar a capability
  **Associated Domains** no App ID (Xcode → Signing & Capabilities → Try
  Again). O registro fica no portal da Apple — `prebuild --clean` futuros não
  quebram de novo.
- Enquanto o domínio não estiver no ar, todo o fluxo testa pelo scheme:

  ```bash
  # simulador
  xcrun simctl openurl booted "clubber://invites/<token>"
  # aparelho físico: digitar clubber://invites/<token> no Safari
  ```

- Quando o domínio subir, validar o handshake de ponta a ponta:

  ```bash
  curl -i https://clubber.social/.well-known/apple-app-site-association
  # esperado: 200, application/json, appIDs K238P4B9K4.com.netobonato.clubber
  curl -i https://clubber.social/.well-known/assetlinks.json
  curl -i https://clubber.social/e/tokenqualquer   # esperado: 404 com landing
  ```

  E no aparelho (app reinstalado): tocar num link `https://clubber.social/e/...`
  real — deve abrir o app direto, sem passar pelo Safari.
