export type ReactNativeFile = { uri: string; name: string; type: string }

declare global {
  interface FormData {
    append(name: string, value: ReactNativeFile): void
  }
}

export function buildImageFile(
  uri: string,
  fallback = 'image.jpg',
): ReactNativeFile {
  const filename = uri.split('/').pop() ?? fallback
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg'
  const type = ext === 'png' ? 'image/png' : 'image/jpeg'
  return { uri, name: filename, type }
}
