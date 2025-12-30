// src/app/admin/login/api/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("LOGIN RESULT:", { error, session: data.session });

    if (error) {
      return NextResponse.json(
        { error: error.message || "تعذر تسجيل الدخول" },
        { status: 400 }
      );
    }

    if (!data.session) {
      return NextResponse.json(
        { error: "لم يتم إنشاء جلسة للمستخدم" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("LOGIN ROUTE ERROR:", err);
    return NextResponse.json(
      { error: "خطأ غير متوقع أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}
