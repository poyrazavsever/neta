import { signup } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ErrorToaster } from '@/components/error-toaster'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const error = resolvedParams?.error;
  const message = resolvedParams?.message;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      {error && message && <ErrorToaster message={String(message)} />}
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">MindSpace</CardTitle>
          <CardDescription className="text-center">
            Yeni bir hesap oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" name="email" type="email" placeholder="ornek@mail.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input id="password" name="password" type="password" required />
              </div>
            </div>
            <div className="flex flex-col space-y-4 mt-6">
              <Button formAction={signup} className="w-full">
                Kayıt Ol
              </Button>
              <div className="text-center text-sm">
                Zaten hesabınız var mı?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Giriş Yap
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
