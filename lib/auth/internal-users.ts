import { createServiceRoleClient } from "@/lib/supabase/admin";

type InternalAuthUserRole = "freelancer" | "client";

type CreateInternalAuthUserInput = {
  email: string;
  password: string;
  role: InternalAuthUserRole;
  reason: string;
};

export async function createInternalAuthUser({
  email,
  password,
  role,
  reason,
}: CreateInternalAuthUserInput) {
  const admin = createServiceRoleClient();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw new Error("E-posta ve şifre zorunludur.");
  }

  const { error: guardError } = await admin.rpc(
    "request_internal_auth_creation",
    {
      target_email: normalizedEmail,
      target_reason: reason,
    },
  );

  if (guardError) {
    throw new Error(
      `Kullanıcı oluşturma hazırlığı tamamlanamadı: ${guardError.message}`,
    );
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    app_metadata: {
      internal_created: true,
      role,
    },
    user_metadata: {
      role,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user?.id) {
    throw new Error("Kullanıcı oluşturuldu fakat kullanıcı kimliği alınamadı.");
  }

  return {
    admin,
    user: data.user,
    userId: data.user.id,
  };
}
