import 'dotenv/config'

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
        displayName: 'ConnectAI',
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

export default {
  expo: {
    name: "connectai-mobile",
    slug: "connectai-mobile",
    version: "1.0.0",
    scheme: "connectai",
    userInterfaceStyle: "automatic",
    ios: {
      bundleIdentifier: 'com.netobonato.connectaimobile',
      // Team ID da Apple Developer (Team ID é público, vai no binário publicado).
      // O prebuild --clean reseta o DEVELOPMENT_TEAM no project.pbxproj se essa
      // chave não estiver no config — quebrava code sign local no Xcode.
      // Override via APPLE_TEAM_ID pra CI/ambientes alternativos.
      appleTeamId: process.env.APPLE_TEAM_ID || 'K238P4B9K4',
    },
    android: {
      package: 'com.netobonato.connectaimobile',
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      ["react-native-vision-camera", {
        cameraPermissionText: "Precisamos da câmera para fotos de perfil e eventos"
      }],
      ["@rnmapbox/maps", {
        RNMAPBOX_MAPS_DOWNLOAD_TOKEN: process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN
      }],
      ["expo-location", {
        locationWhenInUsePermission: "Usamos sua localização para mostrar eventos próximos no mapa.",
        // expo-location força as 3 keys de location no plist; só usamos
        // foreground, mas passamos texto PT-BR específico nas de "Always"
        // pra App Review não receber strings genéricas em inglês.
        locationAlwaysAndWhenInUsePermission: "Usamos sua localização para mostrar eventos próximos no mapa.",
        locationAlwaysPermission: "Usamos sua localização para mostrar eventos próximos no mapa."
      }],
      ["expo-image-picker", {
        photosPermission: "Precisamos de acesso às suas fotos para alterar a foto de perfil.",
        // image-picker é o último plugin a tocar NSCameraUsageDescription;
        // sem isso, sobrescreveria o texto do vision-camera com placeholder
        // genérico em inglês.
        cameraPermission: "Precisamos da câmera para fotos de perfil e eventos",
        // Usamos o microfone nas notas de voz do chat (via expo-audio). Texto
        // PT-BR específico pra não cair no placeholder em inglês do plugin.
        microphonePermission: "Precisamos do microfone para gravar mensagens de voz."
      }],
      ["expo-audio", {
        microphonePermission: "Precisamos do microfone para gravar mensagens de voz."
      }],
      ...socialAuthPlugins()
    ],
    extra: {
      apiUrl: process.env.API_URL,
      mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN,
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
      facebookAppId: process.env.FACEBOOK_APP_ID,
      eas: {
        projectId: "89ff5c01-195a-42ea-a8d0-94425a85a89d"
      }
    }
  }
}
