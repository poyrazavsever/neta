import { signup } from "@/app/login/actions";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ErrorToaster } from "@/components/error-toaster";
import { LockKeyhole, Mail, Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button, Input, Label } from "poyraz-ui/atoms";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const error = resolvedParams?.error;
  const message = resolvedParams?.message;

  return (
    <>
      {error && message && <ErrorToaster message={String(message)} />}
      <AuthPageShell
        title="Kayıt ol"
        description="Freelancer operasyon panelini kullanmak için hesabını oluştur."
        form={
          <form className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  E-posta
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ornek@mail.com"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4 text-muted-foreground" />
                  Şifre
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="h-11"
                />
              </div>
            </div>

            <Button formAction={signup} className="h-11 w-full gap-2">
              <UserPlus className="h-4 w-4" />
              Hesap oluştur
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
                <span className="bg-background px-2 text-muted-foreground">veya</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="h-11 w-full gap-2">
              <Search className="h-4 w-4" />
              Google ile devam et
            </Button>
          </div>
        }
        footer={
          <div className="text-center text-sm">
            Zaten hesabın var mı?{" "}
            <Link
              href="/login"
              className="font-medium text-primary transition-colors hover:text-primary-hover"
            >
              Giriş yap
            </Link>
          </div>
        }
      />
    </>
  );
}
