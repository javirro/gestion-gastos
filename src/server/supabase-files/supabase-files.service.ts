import { createAdminClient } from '@/lib/supabase/admin'

export interface UploadFileInput {
  bucket: string
  path: string
  file: File | Blob | ArrayBuffer
  contentType?: string
  upsert?: boolean
}

export interface UploadFileResult {
  path: string
  publicUrl: string
}

export async function uploadFile(input: UploadFileInput): Promise<UploadFileResult> {
  const supabase = createAdminClient()

  const { data, error } = await supabase.storage.from(input.bucket).upload(input.path, input.file, {
    contentType: input.contentType,
    upsert: input.upsert ?? false
  })

  if (error) throw new Error(error.message)

  const { data: urlData } = supabase.storage.from(input.bucket).getPublicUrl(data.path)

  return {
    path: data.path,
    publicUrl: urlData.publicUrl
  }
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) throw new Error(error.message)
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createAdminClient()

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}
