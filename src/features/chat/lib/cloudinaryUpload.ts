import { buildVideoFile } from '@/shared/utils/videoUpload'

// Resposta (FLAT) do POST /messages/video/signature. Além de
// signature/apiKey/cloudName/resourceType, o backend devolve TODOS os params que
// entraram no api_sign_request (folder, timestamp, type, ...) — coletados aqui no
// index signature. Encaminhamos exatamente o que vier no upload: um param assinado
// a mais ou a menos quebra a assinatura (→ 401 "Invalid Signature" do Cloudinary).
export type SignedUpload = {
  signature: string
  apiKey: string
  cloudName: string
  resourceType: string
  // Params assinados (folder, timestamp, type, ...).
  [param: string]: string | number
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
  const { signature, apiKey, cloudName, resourceType, ...signedParams } = signed

  const form = new FormData()
  // Encaminha exatamente os params assinados (folder, timestamp, type, ...) —
  // programaticamente, pra não quebrar se o backend assinar params novos.
  // cloudName vai na URL e resourceType no path; nenhum dos dois entra no form.
  for (const [key, value] of Object.entries(signedParams)) {
    form.append(key, String(value))
  }
  form.append('api_key', String(apiKey))
  form.append('signature', String(signature))
  form.append('file', buildVideoFile(uri))

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
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
