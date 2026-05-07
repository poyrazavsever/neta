import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ErrorToaster } from '@/components/error-toaster'
import Image from 'next/image'
import { Icon } from '@/components/ui/icon'

export default async function LoginPage({
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
        <div className="relative w-full h-full overflow-hidden rounded-2xl">
          <Image
            src="/images/1830857_Image.png"
            alt="MindSpace Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30 opacity-90" />
          {/* Logo */}
          <div className="absolute bottom-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative drop-shadow-2xl flex items-center gap-4">
              <img
                src="/logo/logo.png"
                alt="MindSpace Logo"
                className="object-contain w-64 h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sağ Taraf - Form Alanı */}
      <div className="flex flex-1 items-center justify-center p-8 w-full lg:w-1/2">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Tekrar Hoş Geldiniz
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Kişisel alanınıza ulaşmak için giriş yapın
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Şifre</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                  >
                    Şifremi unuttum
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="h-11 bg-input-bg border-border"
                />
              </div>
            </div>

            <Button
              formAction={login}
              className="w-full h-11 text-base font-medium shadow-md transition-transform active:scale-[0.98] bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              Giriş Yap
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

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 text-base font-medium bg-card border-border hover:bg-secondary transition-colors"
          >
            <Icon icon="flat-color-icons:google" className="w-5 h-5 mr-2" />
            Google ile Devam Et
          </Button>

          <div className="text-center text-sm mt-6">
            Hesabınız yok mu?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary-hover transition-colors"
            >
              Kayıt Ol
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
