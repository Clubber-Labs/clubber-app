import { useCallback } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { shrinkForUpload } from '../lib/imageShrink'

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
      // Encolhe antes de entregar: o preview passa a mostrar o arquivo que vai
      // subir de verdade, e nenhum caminho de upload precisa lembrar disso.
      onPicked(await Promise.all(result.assets.map(shrinkForUpload)))
    } catch {
      // sistema já mostra prompt de permissão quando necessário
    }
  }, [onPicked, maxCount, quality])
}
