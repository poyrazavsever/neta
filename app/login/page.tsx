import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">MindSpace</CardTitle>
          <CardDescription className="text-center">
            Hesabınıza giriş yapın veya yeni hesap oluşturun
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
            <div className="flex flex-col space-y-2 mt-6">
              <Button formAction={login} className="w-full">
                Giriş Yap
              </Button>
              <Button formAction={signup} variant="outline" className="w-full">
                Kayıt Ol
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
