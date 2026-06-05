import { buildVideoFile } from '@/shared/utils/videoUpload'

// Resposta (FLAT) do POST /messages/video/signature. O backend faz
// api_sign_request({ folder, timestamp }, apiSecret) e devolve o objeto direto —
// sem envelope. cloudName/apiKey/resourceType vêm em camelCase. NÃO há `type`:
// o upload usa o tipo default ('upload') do Cloudinary.
export type SignedUpload = {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
  folder: string
  resourceType: 'video'
}

type CloudinaryUploadResponse = {
  public_id: string
}

// Sobe o arquivo de vídeo DIRETO ao Cloudinary (signed upload), sem passar pelo
// backend e sem o Bearer do app — por isso `fetch` cru, não a instância `api`.
//
// NÃO setamos Content-Type: o runtime gera o boundary do multipart sozinho a
// partir do FormData. (Assimetria proposital com o axios multipart do backend
// — ali o header precisa estar presente; aqui setá-lo manualmente quebraria o
// boundary.)
export async function uploadVideoToCloudinary(
  signed: SignedUpload,
  uri: string,
): Promise<{ publicId: string }> {
  const form = new FormData()
  // EXATAMENTE os params assinados (folder, timestamp) + api_key + signature +
  // file. Um param assinado a mais ou a menos quebra a assinatura (→ 400/401 do
  // Cloudinary). cloudName vai na URL e resourceType no path — nenhum dos dois
  // entra no form.
  form.append('folder', signed.folder)
  form.append('timestamp', String(signed.timestamp))
  form.append('api_key', signed.apiKey)
  form.append('signature', signed.signature)
  form.append('file', buildVideoFile(uri))

  const url = `https://api.cloudinary.com/v1_1/${signed.cloudName}/${signed.resourceType}/upload`
  const res = await fetch(url, { method: 'POST', body: form })
  if (!res.ok) {
    // O Cloudinary devolve { error: { message } } com o motivo real (ex.:
    // assinatura inválida, param faltando, arquivo grande). Propaga pra
    // diagnosticar em vez de só o status cru.
    const detail = await res.text().catch(() => '')
    throw new Error(`Cloudinary upload failed: ${res.status} ${detail}`)
  }
  const data: CloudinaryUploadResponse = await res.json()
  return { publicId: data.public_id }
}
