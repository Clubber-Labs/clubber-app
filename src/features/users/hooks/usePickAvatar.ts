import { useCallback } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { shrinkForUpload } from '@/shared/lib/imageShrink'

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
        // O recorte 1:1 de uma câmera de 48 MP ainda é um arquivo enorme pro
        // avatar de 300x300 que o servidor guarda.
        onPicked(await shrinkForUpload(result.assets[0]))
      }
    } catch {
      // sistema já mostra prompt de permissão quando necessário
    }
  }, [onPicked])
}
