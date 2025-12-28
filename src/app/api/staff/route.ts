import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { email, password, full_name, role, active } = (await req.json()) as {
      email: string;
      password: string;
      full_name: string;
      role: "admin" | "reception";
      active: boolean;
    };

    // 1. إنشاء المستخدم في auth.users
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "فشل إنشاء المستخدم" },
        { status: 500 }
      );
    }

    // 2. إنشاء السجل في admin_users
    const { error: dbError } = await supabase.from("admin_users").insert({
      id: authData.user.id,
      email,
      full_name,
      role,
      active: active ?? true,
    });

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "خطأ غير متوقع أثناء إضافة الموظفة" },
      { status: 500 }
    );
  }
}
