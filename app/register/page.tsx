import { signup } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ErrorToaster } from '@/components/error-toaster'
import Image from 'next/image'
import { Icon } from '@/components/ui/icon'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const error = resolvedParams?.error;
  const message = resolvedParams?.message;

  return (
    <div className="flex min-h-screen bg-background">
      {error && message && <ErrorToaster message={String(message)} />}
      
      {/* Sol Taraf - Resim Alanı */}
      <div className="hidden lg:flex lg:w-1/2 p-4 relative">
        <div className="relative w-full h-full overflow-hidden rounded-2xl bg-black">
          <Image
            src="/images/1830857_Image.png"
            alt="MindSpace Background"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30 opacity-90" />
          {/* Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative w-64 h-64 drop-shadow-2xl">
              <Image
                src="/logo/logo.png"
                alt="MindSpace Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sağ Taraf - Form Alanı */}
      <div className="flex flex-1 items-center justify-center p-8 w-full lg:w-1/2">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Aramıza Katılın</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Kişisel yaşam alanınızı oluşturmak için kayıt olun
            </p>
          </div>

          <form className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="ornek@mail.com" 
                  required 
                  className="h-11 bg-input-bg border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  className="h-11 bg-input-bg border-border"
                />
              </div>
            </div>

            <Button formAction={signup} className="w-full h-11 text-base font-medium shadow-md transition-transform active:scale-[0.98] bg-primary hover:bg-primary-hover text-primary-foreground">
              Kayıt Ol
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                veya
              </span>
            </div>
          </div>

          <Button type="button" variant="outline" className="w-full h-11 text-base font-medium bg-card border-border hover:bg-secondary transition-colors">
            <Icon icon="flat-color-icons:google" className="w-5 h-5 mr-2" />
            Google ile Devam Et
          </Button>

          <div className="text-center text-sm mt-6">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary-hover transition-colors">
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
