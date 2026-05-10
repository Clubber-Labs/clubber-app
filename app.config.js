import 'dotenv/config'

export default {
  expo: {
    name: "connectai-mobile",
    slug: "connectai-mobile",
    version: "1.0.0",
    scheme: "connectai",
    userInterfaceStyle: "automatic",
    ios: {
      bundleIdentifier: 'com.netobonato.connectaimobile',
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
        // expo-location sempre adiciona as 3 keys; só usamos foreground, mas
        // passamos textos PT-BR específicos pras de "Always" pra App Review
        // não exigir justificativa de string genérica.
        locationAlwaysAndWhenInUsePermission: "Usamos sua localização para mostrar eventos próximos no mapa.",
        locationAlwaysPermission: "Usamos sua localização para mostrar eventos próximos no mapa."
      }],
      ["expo-image-picker", {
        photosPermission: "Precisamos de acesso às suas fotos para alterar a foto de perfil.",
        // image-picker sobrescreve a key NSCameraUsageDescription do
        // vision-camera; passamos a mesma string pra não perder o texto.
        cameraPermission: "Precisamos da câmera para fotos de perfil e eventos",
        microphonePermission: false
      }]
    ],
    extra: {
      apiUrl: process.env.API_URL,
      mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN,
      eas: {
        projectId: "89ff5c01-195a-42ea-a8d0-94425a85a89d"
      }
    }
  }
}
