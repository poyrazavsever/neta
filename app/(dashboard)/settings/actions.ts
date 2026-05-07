'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Kullanıcı bulunamadı.' }
  }

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const avatarFile = formData.get('avatar') as File | null

  let avatarUrl = undefined

  // Upload avatar if a new file is provided
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${user.id}/${Math.random()}.${fileExt}`

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, { upsert: true })

    if (uploadError) {
      return { error: 'Profil fotoğrafı yüklenirken hata oluştu: ' + uploadError.message }
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
      
    avatarUrl = publicUrl
  }

  // Update profile
  const updateData: any = {
    first_name: firstName,
    last_name: lastName,
  }
  
  if (avatarUrl) {
    updateData.avatar_url = avatarUrl
  }

  // Upsert profile in case it doesn't exist yet
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, ...updateData })

  if (error) {
    return { error: 'Profil güncellenirken hata oluştu: ' + error.message }
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

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: 'Şifre güncellenirken hata oluştu: ' + error.message }
  }

  return { success: true }
}
