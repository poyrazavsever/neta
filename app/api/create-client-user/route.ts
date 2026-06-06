import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password, client_id } = await request.json();

    if (!email || !password || !client_id) {
      return NextResponse.json(
        { error: "Email, şifre ve müşteri ID gereklidir." },
        { status: 400 }
      );
    }

    // Initialize Supabase Admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Create the user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Kullanıcı oluşturulamadı." },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // 2. Wait for trigger to create the profile (it might take a fraction of a second, but usually synchronous in Postgres)
    // We update the profile to set the role to 'client'
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ role: "client" })
      .eq("id", userId);

    if (profileError) {
      console.error("Profile update error:", profileError);
      // Optional: Handle partial failure
    }

    // 3. Link the user to the client record
    const { error: clientError } = await supabaseAdmin
      .from("clients")
      .update({ client_auth_id: userId })
      .eq("id", client_id);

    if (clientError) {
      console.error("Client link error:", clientError);
      return NextResponse.json(
        { error: "Kullanıcı oluşturuldu fakat müşteri kaydıyla ilişkilendirilemedi." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (err: any) {
    console.error("Create client user error:", err);
    return NextResponse.json(
      { error: "Sunucu tarafında beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}
