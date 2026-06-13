import { NextResponse } from "next/server";

type SupabaseAdminUserResponse = {
  id?: string;
  email?: string;
  message?: string;
  error_description?: string;
};

export async function POST(request: Request) {
  try {
    const { email, password, client_id } = await request.json();

    if (!email || !password || !client_id) {
      return NextResponse.json(
        { error: "Email, şifre ve müşteri ID gereklidir." },
        { status: 400 },
      );
    }

    const supabaseUrl =
      process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase service role ayarı eksik." },
        { status: 500 },
      );
    }

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: getServiceHeaders(serviceRoleKey),
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        app_metadata: {
          internal_created: true,
          role: "client",
        },
      }),
    });
    const userPayload = (await userResponse.json()) as SupabaseAdminUserResponse;

    if (!userResponse.ok || !userPayload.id) {
      return NextResponse.json(
        {
          error:
            userPayload.message ||
            userPayload.error_description ||
            "Kullanıcı oluşturulamadı.",
        },
        { status: 400 },
      );
    }

    const userId = userPayload.id;

    await patchRestRow({
      supabaseUrl,
      serviceRoleKey,
      table: "profiles",
      filter: `id=eq.${encodeURIComponent(userId)}`,
      payload: { role: "client" },
    });

    const clientResponse = await patchRestRow({
      supabaseUrl,
      serviceRoleKey,
      table: "clients",
      filter: `id=eq.${encodeURIComponent(client_id)}`,
      payload: { client_auth_id: userId },
    });

    if (!clientResponse.ok) {
      return NextResponse.json(
        { error: "Kullanıcı oluşturuldu fakat müşteri kaydıyla ilişkilendirilemedi." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, user: userPayload });
  } catch (error) {
    console.error("Create client user error:", error);
    return NextResponse.json(
      { error: "Sunucu tarafında beklenmeyen bir hata oluştu." },
      { status: 500 },
    );
  }
}

function getServiceHeaders(serviceRoleKey: string) {
  return {
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
    "content-type": "application/json",
  };
}

function patchRestRow({
  supabaseUrl,
  serviceRoleKey,
  table,
  filter,
  payload,
}: {
  supabaseUrl: string;
  serviceRoleKey: string;
  table: string;
  filter: string;
  payload: Record<string, unknown>;
}) {
  return fetch(`${supabaseUrl}/rest/v1/${table}?${filter}`, {
    method: "PATCH",
    headers: {
      ...getServiceHeaders(serviceRoleKey),
      prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });
}
