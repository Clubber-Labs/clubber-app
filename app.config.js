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
        locationWhenInUsePermission: "Usamos sua localização para mostrar eventos próximos no mapa."
      }],
      ["expo-image-picker", {
        photosPermission: "Precisamos de acesso às suas fotos para alterar a foto de perfil."
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
