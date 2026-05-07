import { useCallback } from 'react'
import { Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

export function usePickAvatar(onPicked: (uri: string) => void) {
  return useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })
      if (!result.canceled && result.assets[0]) {
        onPicked(result.assets[0].uri)
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir a galeria.')
    }
  }, [onPicked])
}
