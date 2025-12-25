import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type Params = Promise<{ id: string }>;

export async function PATCH(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;

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

    const body = await req.json();
    const {
      name,
      bio_ar,
      avatar_url,
      phone,
      email,
      active,
      display_order,
    } = body as {
      name?: string;
      bio_ar?: string;
      avatar_url?: string | null;
      phone?: string;
      email?: string;
      active?: boolean;
      display_order?: number | null;
    };

    if (!name) {
      return NextResponse.json(
        { error: "الاسم مطلوب" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("specialists")
      .update({
        name,
        bio_ar: bio_ar ?? "",
        avatar_url: avatar_url ?? null,
        phone: phone ?? "",
        email: email ?? "",
        active: active ?? true,
        display_order: display_order ?? 0,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: "خطأ غير متوقع أثناء تعديل الأخصائية" },
      { status: 500 }
    );
  }
}
