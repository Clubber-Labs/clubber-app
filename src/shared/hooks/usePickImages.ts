import { useCallback } from 'react'
import * as ImagePicker from 'expo-image-picker'

type Options = {
  maxCount?: number
  quality?: number
}

export function usePickImages(
  onPicked: (uris: string[]) => void,
  { maxCount = 5, quality = 0.8 }: Options = {},
) {
  return useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: maxCount,
        quality,
      })
      if (result.canceled || result.assets.length === 0) return
      onPicked(result.assets.map(a => a.uri))
    } catch {
      // sistema já mostra prompt de permissão quando necessário
    }
  }, [onPicked, maxCount, quality])
}
