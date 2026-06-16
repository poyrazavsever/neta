'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getFirstAdminSetupState } from '@/lib/auth/first-admin-setup'
import { createInternalAuthUser } from '@/lib/auth/internal-users'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/login?error=true&message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const setupState = await getFirstAdminSetupState()

  if (setupState.errorMessage) {
    redirect(`/register?error=true&message=${encodeURIComponent(setupState.errorMessage)}`)
  }

  if (!setupState.available) {
    redirect(
      `/login?error=true&message=${encodeURIComponent(
        'Kayıt kapalı. Bu Neta kurulumunda ilk admin hesabı zaten oluşturulmuş.',
      )}`,
    )
  }

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  try {
    await createInternalAuthUser({
      email: data.email,
      password: data.password,
      role: 'freelancer',
      reason: 'first_admin',
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Kullanıcı oluşturulamadı.'
    redirect(`/register?error=true&message=${encodeURIComponent(message)}`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/login?error=true&message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()

  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/login')
}
