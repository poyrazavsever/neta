import { createInternalAuthUser } from "@/lib/auth/internal-users";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password, client_id } = await request.json();

    if (!email || !password || !client_id) {
      return NextResponse.json(
        { error: "E-posta, şifre ve müşteri ID gereklidir." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Müşteri hesabı oluşturmak için giriş yapmalısınız." },
        { status: 401 },
      );
    }

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, client_auth_id")
      .eq("id", client_id)
      .eq("user_id", user.id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: "Müşteri kaydı bulunamadı." },
        { status: 404 },
      );
    }

    if (client.client_auth_id) {
      return NextResponse.json(
        { error: "Bu müşteri için portal hesabı zaten oluşturulmuş." },
        { status: 409 },
      );
    }

    const {
      admin,
      user: createdUser,
      userId,
    } = await createInternalAuthUser({
      email,
      password,
      role: "client",
      reason: "client_portal",
    });

    const { error: profileError } = await admin
      .from("profiles")
      .update({ role: "client" })
      .eq("id", userId);

    if (profileError) {
      return NextResponse.json(
        {
          error: `Kullanıcı oluşturuldu fakat profil rolü güncellenemedi: ${profileError.message}`,
        },
        { status: 500 },
      );
    }

    const { error: updateClientError } = await admin
      .from("clients")
      .update({ client_auth_id: userId })
      .eq("id", client_id)
      .eq("user_id", user.id);

    if (updateClientError) {
      return NextResponse.json(
        {
          error: `Kullanıcı oluşturuldu fakat müşteri kaydıyla ilişkilendirilemedi: ${updateClientError.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, user: createdUser });
  } catch (error) {
    console.error("Create client user error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Sunucu tarafında beklenmeyen bir hata oluştu.",
      },
      { status: 500 },
    );
  }
}
