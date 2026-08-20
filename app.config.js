import 'dotenv/config'
import { withEntitlementsPlist } from 'expo/config-plugins'
import { BOARD as SPLASH_BOARD } from './scripts/splash-spec.mjs'

// Build local de iOS sem conta paga do Apple Developer Program: o profile
// automático do time não cobre aps-environment (adicionado pelo plugin do
// expo-notifications) e o xcodebuild falha. IOS_DISABLE_PUSH=1 no .env.local
// remove o entitlement no prebuild — push iOS fica fora DESTE build e o app
// degrada gracioso (getExpoPushTokenAsync falha dentro de try/catch). Nunca
// setar em build EAS/produção; não commitar o ios/ gerado com o flag ativo.
// ATENÇÃO à posição na lista de plugins: mods executam na ORDEM INVERSA —
// este plugin precisa ser o PRIMEIRO da lista pra rodar por último e vencer
// o withEntitlementsPlist do expo-notifications (que re-adiciona a chave se
// não existir).
function withoutIosPushEntitlement(config) {
  return withEntitlementsPlist(config, c => {
    delete c.modResults['aps-environment']
    return c
  })
}

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

  const fbAppId = process.env.FACEBOOK_APP_ID
  const fbToken = process.env.FACEBOOK_CLIENT_TOKEN
  if (fbAppId && /^\d{10,}$/.test(fbAppId) && fbToken && fbToken.length >= 20) {
    plugins.push([
      'react-native-fbsdk-next',
      {
        appID: fbAppId,
        clientToken: fbToken,
        displayName: 'Clubber',
        scheme: `fb${fbAppId}`,
        advertiserIDCollectionEnabled: false,
        autoLogAppEventsEnabled: false,
        isAutoInitEnabled: true,
      },
    ])
  } else {
    console.warn(
      '[app.config] FACEBOOK_APP_ID/CLIENT_TOKEN ausentes ou inválidos — Facebook Login desabilitado neste build.',
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
    version: "1.0.0",
    scheme: "clubber",
    userInterfaceStyle: "automatic",
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
      ...(process.env.IOS_DISABLE_PUSH === '1'
        ? [withoutIosPushEntitlement]
        : []),
      "expo-router",
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
      ...socialAuthPlugins()
    ],
    extra: {
      apiUrl: process.env.API_URL,
      mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN,
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
      facebookAppId: process.env.FACEBOOK_APP_ID,
      // Chave PÚBLICA do Stripe (pk_test_/pk_live_) — PaymentSheet nativa.
      // A secret key NUNCA entra no app; tudo sensível passa pelo backend.
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      eas: {
        projectId: "89ff5c01-195a-42ea-a8d0-94425a85a89d"
      }
    }
  }
}
