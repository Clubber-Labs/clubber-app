# Clubber Mobile

Aplicativo mobile do Clubber — plataforma para descoberta e criação de eventos, conexão entre pessoas e feed social com mapa integrado.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React Native + Expo SDK 54 (bare workflow) |
| Linguagem | TypeScript (strict) |
| Navegação | Expo Router v6 (file-based) |
| Dados remotos | TanStack Query v5 |
| Estado global | Zustand v5 |
| HTTP | Axios |
| Formulários | React Hook Form + Zod v4 |
| Estilização | NativeWind v4 (Tailwind para RN) |
| Autenticação | JWT via Expo SecureStore |
| Câmera | react-native-vision-camera v3 |
| Mapas | @rnmapbox/maps |
| Push notifications | expo-notifications |
| Build / CI | EAS (Expo Application Services) |

## Requisitos da máquina (macOS)

### Essenciais

- Node.js `18+` (recomendado: `20 LTS`)
- pnpm `10+` (via Corepack)
- Git
- Xcode (App Store) com Command Line Tools
- CocoaPods
- Conta no [Expo](https://expo.dev)

### Opcionais (somente se for rodar Android no Mac)

- Android Studio
- Android SDK (API 35+)
- Emulador Android configurado
- Java 17

### Instalação sugerida dos requisitos

```bash
# Homebrew (caso não tenha)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Ferramentas base
brew install node watchman cocoapods git

# Ativar o pnpm via Corepack
corepack enable
corepack prepare pnpm@latest --activate
```

Instalar Xcode pela App Store e depois executar:

```bash
sudo xcodebuild -runFirstLaunch
xcode-select --install
```

Se você for usar Android também:

```bash
brew install --cask android-studio
brew install openjdk@17
```

### Validar se o ambiente está pronto

```bash
node -v
pnpm -v
git --version
xcodebuild -version
pod --version
```

## Requisitos da máquina (Windows)

> No Windows, este projeto roda em **Android**. Build iOS exige macOS + Xcode.

### Essenciais

- Windows 10/11
- Node.js `18+` (recomendado: `20 LTS`)
- pnpm `10+` (via Corepack)
- Git
- Android Studio
- Android SDK (API 35+)
- Java 17
- Conta no [Expo](https://expo.dev)

### Instalação sugerida dos requisitos (PowerShell)

```powershell
# Ativar pnpm via Corepack
corepack enable
corepack prepare pnpm@latest --activate
```

Depois, no Android Studio:

1. Instale o Android SDK (API 35 ou superior)
2. Instale o Android SDK Platform-Tools
3. Instale o Android SDK Build-Tools
4. Crie um emulador em Device Manager

### Variáveis de ambiente (Windows)

Defina no sistema:

- `ANDROID_HOME` = `C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk`
- Adicionar ao `Path`:
  - `%ANDROID_HOME%\platform-tools`
  - `%ANDROID_HOME%\emulator`

### Validar ambiente no Windows

```powershell
node -v
pnpm -v
git --version
java -version
adb --version
```

## Instalação do projeto

```bash
# Clonar o repositório
git clone https://github.com/netobonato/connectai-mobile.git
cd connectai-mobile

# Instalar dependências JS
pnpm install

# Instalar pods do iOS (bare workflow)
cd ios && pod install && cd ..

# Configurar variáveis de ambiente
cp .env.example .env.local
```

Depois edite o arquivo `.env.local` com os valores reais.

No Windows (PowerShell), use:

```powershell
Copy-Item .env.example .env.local
```

## Variáveis de ambiente

Crie `.env.local` na raiz (nunca commitar):

```env
API_URL=http://localhost:3333
RNMAPBOX_MAPS_DOWNLOAD_TOKEN=sk.ey...seu_token_aqui
```

> Em produção, os valores são injetados via EAS Secrets — nunca ficam no repositório.

## Como rodar localmente (passo a passo)

### 1) Subir backend/API

Antes do app mobile, garanta que a API esteja rodando e acessível na URL definida em `API_URL`.

### 2) Configurar variáveis de ambiente

Arquivo `.env.local`:

```env
API_URL=http://localhost:3333
RNMAPBOX_MAPS_DOWNLOAD_TOKEN=sk.ey...seu_token_aqui
```

### 3) Rodar no iOS (MacBook)

```bash
# compilar e instalar o app no simulador iOS (primeira vez pode demorar)
pnpm ios
```

Em outro terminal, inicie o Metro:

```bash
pnpm start
```

Se o simulador não abrir automaticamente:

```bash
open -a Simulator
```

### 4) Rodar no Android (opcional)

Com o emulador Android aberto:

```bash
pnpm android
```

### 4.1) Rodar no Windows (Android)

Com o emulador Android aberto no Android Studio:

```powershell
pnpm android
```

Se quiser só iniciar o bundler:

```powershell
pnpm start
```

### 5) Fluxo diário após primeira build

Depois que o app já foi instalado no simulador/emulador:

```bash
pnpm start
```

> O projeto usa `expo start --dev-client`. Isso significa que você precisa do app de desenvolvimento instalado no dispositivo/simulador (gerado por `pnpm ios` ou `pnpm android`).

## Troubleshooting rápido

- Porta ocupada no Metro:
  - Rode `pnpm expo start --clear`.
- Erro de pods no iOS:
  - Rode `cd ios && pod install && cd ..`.
- Alterou dependência nativa e quebrou build:
  - Rode `pnpm expo prebuild --clean` e depois `cd ios && pod install && cd ..`.
- App abre mas não conecta na API:
  - Verifique se `API_URL` aponta para a API correta e se o backend está online.

## Estrutura de pastas

```
src/
├── app/                        # Rotas (Expo Router — file-based)
│   ├── _layout.tsx             # Layout raiz (providers globais)
│   ├── (auth)/                 # Telas públicas (não autenticadas)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                 # Telas autenticadas com tab bar
│   │   ├── _layout.tsx
│   │   ├── feed/
│   │   ├── map/
│   │   └── profile/
│   └── events/
│       ├── [id].tsx            # Detalhe do evento
│       └── create.tsx
│
├── features/                   # Domínios da aplicação
│   ├── auth/                   # Autenticação (login, cadastro, sessão)
│   ├── events/                 # Criação e visualização de eventos
│   ├── feed/                   # Feed de eventos
│   ├── follows/                # Sistema de follows
│   └── notifications/          # Push notifications
│
└── shared/                     # Código verdadeiramente compartilhado
    ├── components/             # Button, Input, Avatar...
    ├── hooks/                  # useDebounce, usePagination
    ├── lib/                    # api.ts, queryClient.ts, secureStore.ts
    └── types/                  # ApiError, PaginatedResponse...
```

A arquitetura segue **Feature-Sliced + Clean Architecture**: cada feature é autossuficiente, a tela nunca chama o service diretamente (sempre via hook), e `shared/` nunca importa de `features/`.

## Scripts

```bash
pnpm start             # Inicia o Metro bundler
pnpm ios               # Roda no simulador iOS
pnpm android           # Roda no emulador Android

pnpm lint              # Reporta erros de ESLint
pnpm lint:fix          # Corrige erros automaticamente
pnpm format            # Formata o código com Prettier
pnpm format:check      # Verifica formatação sem modificar
pnpm typecheck         # Verificação de tipos TypeScript

pnpm build:ios         # Build iOS via EAS
pnpm build:android     # Build Android via EAS
pnpm build:all         # Build iOS + Android via EAS
```

## Build com EAS

```bash
# Autenticar
eas login

# Build de desenvolvimento (com dev client)
eas build --profile development --platform ios

# Build de preview (TestFlight / APK interno)
eas build --profile preview --platform all

# Build de produção (App Store / Play Store)
eas build --profile production --platform all
```

Perfis disponíveis em [`eas.json`](eas.json):

| Perfil | Uso |
|---|---|
| `development` | Dev local com development client |
| `preview` | Testes internos (TestFlight / APK) |
| `production` | App Store / Play Store |

## Qualidade de código

O projeto usa ESLint v10 + Prettier v3. As regras principais:

- TypeScript strict — sem `any`, sem `as unknown`
- `import type` obrigatório para imports de tipo
- `react-hooks/rules-of-hooks` e `exhaustive-deps` ativos
- Formatação: sem ponto-e-vírgula, aspas simples, trailing comma, 80 chars

## Fluxo de contribuição

```
1. git checkout main && git pull
2. git checkout -b feat/nome-da-feature
3. Desenvolver e commitar seguindo Conventional Commits em português
4. git push origin feat/nome-da-feature
5. Abrir Pull Request no GitHub
6. Aguardar aprovação do owner para merge
```

Formato de commit:

```
feat: adicionar tela de listagem de eventos
fix: corrigir token expirado não redirecionando para login
chore: atualizar dependências do Expo SDK 54
```

## Licença

Privado — todos os direitos reservados.
