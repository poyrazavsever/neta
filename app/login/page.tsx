import { login } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ErrorToaster } from '@/components/error-toaster'
import { Icon } from '@/components/ui/icon'
import { AuthPageShell } from '@/components/auth/auth-page-shell'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const error = resolvedParams?.error
  const message = resolvedParams?.message

  return (
    <>
      {error && message && <ErrorToaster message={String(message)} />}
      <AuthPageShell
        title="Tekrar Hoş Geldiniz"
        description="Kişisel alanınıza ulaşmak için giriş yapın"
        imageSrc="/images/1830857_Image.png"
        imageAlt="MindSpace Background"
        imageSide="left"
        form={
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
        }
        secondaryAction={
          <div className="space-y-6">
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
          </div>
        }
        footer={
          <div className="text-center text-sm">
            Hesabınız yok mu?{' '}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary-hover transition-colors"
            >
              Kayıt Ol
            </Link>
          </div>
        }
      />
    </>
  )
}
