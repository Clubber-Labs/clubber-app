import { useCallback } from 'react'
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
      // sistema já mostra prompt de permissão quando necessário
    }
  }, [onPicked])
}
