const { withAndroidManifest } = require('expo/config-plugins')

const INSTAGRAM_PACKAGE = 'com.instagram.android'

// Package visibility (targetSdk 30+): sem declarar o Instagram em <queries>, o
// PackageManager mente pro app — `isPackageInstalled` devolve false e o intent
// ADD_TO_STORY não resolve, mesmo com o IG instalado. O <provider> que o
// react-native-share precisa vem do manifesto da própria lib (merge), então
// este plugin cuida só da visibilidade.
module.exports = function withInstagramStories(config) {
  return withAndroidManifest(config, config => {
    const { manifest } = config.modResults
    manifest.queries = manifest.queries ?? [{}]
    const [queries] = manifest.queries
    queries.package = queries.package ?? []
    const declared = queries.package.some(
      entry => entry.$?.['android:name'] === INSTAGRAM_PACKAGE,
    )
    if (!declared) {
      queries.package.push({ $: { 'android:name': INSTAGRAM_PACKAGE } })
    }
    return config
  })
}
