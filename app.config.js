import 'dotenv/config'
import { BOARD as SPLASH_BOARD } from './scripts/splash-spec.mjs'
import { EXTRA_FROM_ENV } from './scripts/extra-env.mjs'

// Dois consumidores que não podem divergir: `extra.eas.projectId` (build) e a
// URL do servidor de updates (OTA). Errar um dos dois publica pra lugar nenhum.
const EAS_PROJECT_ID = '046e5dc6-83ed-4602-bb1d-c30fe364fafe'

// Reverse-DNS do iOS Client ID = URL scheme que o Google Sign-In registra no
// Info.plist. Ex: 1234-abc.apps.googleusercontent.com → com.googleusercontent.apps.1234-abc
function reversedGoogleIosClientId() {
  const id = process.env.GOOGLE_IOS_CLIENT_ID
  if (!id || !id.endsWith('.apps.googleusercontent.com')) return null
  return `com.googleusercontent.apps.${id.replace('.apps.googleusercontent.com', '')}`
}

// Plugins de login social só entram se as credenciais estão preenchidas com
// valores plausíveis. Sem isso o build trava com erro críptico antes de chegar
// nas telas — e o user perde o caminho do login tradicional.
function socialAuthPlugins() {
  const plugins = []
  const iosUrlScheme = reversedGoogleIosClientId()
  if (iosUrlScheme) {
    plugins.push(['@react-native-google-signin/google-signin', { iosUrlScheme }])
  } else {
    console.warn(
      '[app.config] GOOGLE_IOS_CLIENT_ID ausente ou inválido — Google Sign-In desabilitado neste build.',
    )
  }

  return plugins
}

// Copy pt-BR das permissões do iOS em UM lugar só. Ela tem DOIS consumidores que
// precisam concordar: as opções dos plugins abaixo (que escrevem o Info.plist
// base) e o dicionário pt-BR de `locales` (que gera o .lproj). Divergir é uma
// armadilha silenciosa — um aparelho em português lê o .lproj, então editar só a
// opção do plugin não muda nada na tela.
const IOS_PERMISSIONS_PT = {
  NSCameraUsageDescription:
    'Precisamos da câmera para fotos de perfil e eventos',
  NSMicrophoneUsageDescription:
    'Precisamos do microfone para gravar mensagens de voz.',
  NSPhotoLibraryUsageDescription:
    'Precisamos de acesso às suas fotos para alterar a foto de perfil.',
  // expo-location força as 3 chaves no plist; só usamos foreground, mas as de
  // "Always" levam texto específico pra App Review não receber genérico.
  NSLocationWhenInUseUsageDescription:
    'Usamos sua localização para mostrar eventos próximos no mapa e, se você ativar, avisar de eventos perto de você.',
  NSLocationAlwaysAndWhenInUseUsageDescription:
    'Usamos sua localização para mostrar eventos próximos no mapa e, se você ativar, avisar de eventos perto de você.',
  NSLocationAlwaysUsageDescription:
    'Usamos sua localização para mostrar eventos próximos no mapa e, se você ativar, avisar de eventos perto de você.',
  NSFaceIDUsageDescription:
    'O Face ID protege os dados guardados neste aparelho, como a sua sessão.',
}

export default {
  expo: {
    name: "Clubber",
    slug: "clubber",
    owner: "netobonato",
    version: "1.0.0",
    scheme: "clubber",
    userInterfaceStyle: "automatic",
    // Sem isto o Expo assume ['ios','android','web'], e o `expo export
    // --platform=all` do EAS Update tenta empacotar web — que este projeto não
    // suporta (não há react-native-web). A falha sai disfarçada: o transform de
    // web não resolve o babel-preset-expo e o erro aparece como "iOS Bundling
    // failed / Cannot find module".
    platforms: ["ios", "android"],
    // OTA (EAS Update). Runbook e disciplina de rollback: docs/eas-update.md.
    // fallbackToCacheTimeout 0 = o launch NUNCA espera a rede: o app abre com o
    // bundle que já tem, baixa a atualização em background e aplica no cold
    // start seguinte. Bloquear aqui atrasaria a splash de quem está em 3G ruim
    // pra entregar um ganho que pode esperar mais uma abertura.
    updates: {
      url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
      fallbackToCacheTimeout: 0,
      checkAutomatically: "ON_LOAD",
      // Canal só para build LOCAL (`env UPDATES_CHANNEL=preview expo run:ios`).
      // Quem carimba o canal normalmente é o EAS Build, a partir do `channel`
      // do perfil no eas.json — build local não passa por lá e sairia sem canal
      // nenhum, incapaz de receber update. Sem a variável, o objeto nem existe,
      // então o EAS segue carimbando o dele sem interferência.
      ...(process.env.UPDATES_CHANNEL
        ? { requestHeaders: { "expo-channel-name": process.env.UPDATES_CHANNEL } }
        : {}),
    },
    // Fingerprint = hash do projeto nativo (config + plugins + deps nativas).
    // Mexeu em algo que exige binário novo? A runtime version muda sozinha e os
    // binários antigos param de receber este canal — em vez de receberem um
    // bundle que chama um módulo nativo que eles não têm e crashar no boot.
    // A alternativa (policy 'appVersion') dependeria de lembrar de subir a
    // versão a cada mudança nativa; esta não depende de ninguém lembrar.
    runtimeVersion: { policy: "fingerprint" },
    // Strings NATIVAS (diálogo de permissão do iOS) por idioma — não confundir
    // com src/shared/i18n/locales/, que é a copy do app: quem renderiza estas é o
    // SO, e elas não passam pelo i18next. O prebuild as vira
    // ios/Clubber/Supporting/<lang>.lproj/InfoPlist.strings — hoje commitados à
    // mão (ver docs/migracao-cng.md), e esta chave é o que garante que ele gere o
    // mesmo quando voltar a rodar. pt-BR sai do objeto acima em vez de arquivo
    // porque é o idioma-base; en/es são tradução pura e ficam em JSON.
    locales: {
      "pt-BR": { ios: IOS_PERMISSIONS_PT },
      en: "./assets/native-locales/en.json",
      es: "./assets/native-locales/es.json",
    },
    // Ícone = sticker inclinado (rotação de -8° JÁ embutida no PNG — nunca
    // aplicar transform por fora). No chrome do app o BrandB fica reto; o
    // inclinado em UI é só o BrandSticker. icon-viva.png = alternativo de
    // campanha, só entra se pedido.
    icon: "./assets/icon.png",
    ios: {
      bundleIdentifier: 'com.netobonato.clubber',
      icon: "./assets/icon.png",
      // Team ID da Apple Developer (Team ID é público, vai no binário publicado).
      // O prebuild --clean reseta o DEVELOPMENT_TEAM no project.pbxproj se essa
      // chave não estiver no config — quebrava code sign local no Xcode.
      // Override via APPLE_TEAM_ID pra CI/ambientes alternativos.
      appleTeamId: process.env.APPLE_TEAM_ID || 'K238P4B9K4',
      // O app só usa cripto isenta (HTTPS/ATS). Sem esta chave, TODA subida ao
      // TestFlight pergunta sobre exportação de criptografia na mão.
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        // Sem CFBundleLocalizations o iOS não cruza os idiomas do usuário com
        // os do app, e o expo-localization devolve o idioma de desenvolvimento
        // (en) em build de release — iPhone em português abria o app em inglês
        // (visto no TestFlight build 3). Os .lproj existirem não basta; a
        // declaração é o que liga o language matching.
        CFBundleAllowMixedLocalizations: true,
        CFBundleLocalizations: ['pt-BR', 'en', 'es'],
      },
      // O prebuild NÃO gera PrivacyInfo.xcprivacy sozinho — sem esta chave o
      // --clean apaga o manifesto e a referência dele no pbxproj. Conteúdo
      // espelha o arquivo que era commitado à mão (required-reason APIs do RN/
      // Expo: file timestamp, UserDefaults, boot time, disk space).
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp',
            NSPrivacyAccessedAPITypeReasons: ['C617.1', '0A2A.1', '3B52.1'],
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
            NSPrivacyAccessedAPITypeReasons: ['CA92.1', 'C56D.1'],
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime',
            NSPrivacyAccessedAPITypeReasons: ['35F9.1'],
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryDiskSpace',
            NSPrivacyAccessedAPITypeReasons: ['E174.1', '85F4.1'],
          },
        ],
        NSPrivacyCollectedDataTypes: [],
        NSPrivacyTracking: false,
      },
    },
    android: {
      package: 'com.netobonato.clubber',
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#0B0B0D",
      },
      // FCM v1 (push). O arquivo vem do Firebase console e é registrado via
      // `eas credentials` / env GOOGLE_SERVICES_JSON — sem ele o push Android
      // não chega, mas o build local segue funcionando.
      ...(process.env.GOOGLE_SERVICES_JSON
        ? { googleServicesFile: process.env.GOOGLE_SERVICES_JSON }
        : {}),
    },
    plugins: [
      "expo-router",
      // AppCheckCore 11.3+ (transitiva do GoogleSignIn) depende de
      // GoogleUtilities e RecaptchaInterop, que não definem módulos — o pod
      // install quebra em lib estática ("cannot yet be integrated as static
      // libraries", visto no EAS em 2026-08-21). modular_headers é o fix que
      // o próprio CocoaPods recomenda; version fica livre de propósito.
      ["expo-build-properties", {
        ios: {
          extraPods: [
            { name: "GoogleUtilities", modular_headers: true },
            { name: "RecaptchaInterop", modular_headers: true },
          ],
        },
      }],
      // Splash NATIVA (o SO desenha antes do JS subir; o SplashOverlay é o 2º
      // estágio). A imagem é a MESMA composição do SplashScreen.tsx, gerada por
      // scripts/build-splash-logo.mjs — mudar o componente sem rodar `pnpm
      // splash:build` faz os dois estágios divergirem. O imageWidth vem do mesmo
      // spec que dimensiona o artboard, porque o plugin força quadrado
      // (height = imageWidth) e os dois fora de sincronia encolhem a arte.
      ["expo-splash-screen", {
        image: "./assets/splash-logo.png",
        backgroundColor: "#0B0B0D",
        imageWidth: SPLASH_BOARD,
        // Android 12+ desenha a splash ele mesmo e SEMPRE recorta o ícone num
        // círculo — a composição adesivo+wordmark sai mutilada (verificado em
        // emulador API 35). Só o balão sobrevive à máscara; a composição
        // completa continua no 2º estágio (SplashOverlay JS). iOS não tem
        // máscara e segue com a arte inteira acima.
        android: {
          image: "./assets/icon.png",
          imageWidth: 288
        }
      }],
      // O plugin declara NSFaceIDUsageDescription com um texto genérico em
      // inglês; era a única permissão fora do padrão das outras. O app não pede
      // biometria hoje (nenhum requireAuthentication) — o texto descreve o que o
      // Face ID protegeria, e a decisão de manter ou remover a permissão em si
      // não é desta fase.
      ["expo-secure-store", {
        faceIDPermission: IOS_PERMISSIONS_PT.NSFaceIDUsageDescription
      }],
      ["@rnmapbox/maps", {
        RNMAPBOX_MAPS_DOWNLOAD_TOKEN: process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN
      }],
      "expo-notifications",
      ["expo-location", {
        locationWhenInUsePermission: IOS_PERMISSIONS_PT.NSLocationWhenInUseUsageDescription,
        locationAlwaysAndWhenInUsePermission: IOS_PERMISSIONS_PT.NSLocationAlwaysAndWhenInUseUsageDescription,
        locationAlwaysPermission: IOS_PERMISSIONS_PT.NSLocationAlwaysUsageDescription
      }],
      ["expo-image-picker", {
        photosPermission: IOS_PERMISSIONS_PT.NSPhotoLibraryUsageDescription,
        // Sem esta opção o plugin escreve NSCameraUsageDescription com
        // placeholder genérico em inglês.
        cameraPermission: IOS_PERMISSIONS_PT.NSCameraUsageDescription,
        // Usamos o microfone nas notas de voz do chat (via expo-audio). Texto
        // específico pra não cair no placeholder em inglês do plugin.
        microphonePermission: IOS_PERMISSIONS_PT.NSMicrophoneUsageDescription
      }],
      ["expo-audio", {
        microphonePermission: IOS_PERMISSIONS_PT.NSMicrophoneUsageDescription
      }],
      ["expo-video", {
        supportsBackgroundPlayback: false,
        supportsPictureInPicture: false
      }],
      // Gera o entitlement com.apple.developer.applesignin no prebuild.
      // Android não é afetado (o botão nem renderiza lá).
      "expo-apple-authentication",
      ...socialAuthPlugins()
    ],
    // Os pares chave↔variável moram em scripts/extra-env.mjs porque o
    // publish-update.mjs lê a MESMA lista pra recusar publicar sem elas.
    extra: {
      ...Object.fromEntries(
        Object.entries(EXTRA_FROM_ENV).map(([key, name]) => [
          key,
          process.env[name],
        ]),
      ),
      eas: {
        projectId: EAS_PROJECT_ID
      }
    }
  }
}
