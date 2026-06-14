'use server'

import { revalidatePath } from 'next/cache'

import { createServiceRoleClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type ProfileUpdateData = {
  first_name: string
  last_name: string
  avatar_url?: string
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Kullanıcı bulunamadı.' }
  }

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const avatarFile = formData.get('avatar') as File | null

  let avatarUrl: string | undefined

  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${user.id}/${Math.random()}.${fileExt}`
    const admin = createServiceRoleClient()

    const { error: uploadError } = await admin.storage
      .from('avatars')
      .upload(fileName, avatarFile, { upsert: true })

    if (uploadError) {
      return {
        error: `Profil fotoğrafı yüklenirken hata oluştu: ${uploadError.message}`,
      }
    }

    const {
      data: { publicUrl },
    } = admin.storage.from('avatars').getPublicUrl(fileName)

    avatarUrl = publicUrl
  }

  const updateData: ProfileUpdateData = {
    first_name: firstName,
    last_name: lastName,
  }

  if (avatarUrl) {
    updateData.avatar_url = avatarUrl
  }

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    ...updateData,
  })

  if (error) {
    return { error: `Profil güncellenirken hata oluştu: ${error.message}` }
  }

  revalidatePath('/settings')
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  if (!password || password.length < 6) {
    return { error: 'Şifre en az 6 karakter olmalıdır.' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: `Şifre güncellenirken hata oluştu: ${error.message}` }
  }

  return { success: true }
}
