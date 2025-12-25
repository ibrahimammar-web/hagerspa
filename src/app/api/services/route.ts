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

    const body = await req.json();
    const {
      name_ar,
      name_en,
      description_ar,
      duration_min,
      price_sar,
      image_url,
      category,
      active,
      display_order,
    } = body as {
      name_ar?: string;
      name_en?: string;
      description_ar?: string;
      duration_min?: number;
      price_sar?: number;
      image_url?: string | null;
      category?: string;
      active?: boolean;
      display_order?: number | null;
    };

    if (!name_ar || !duration_min || !price_sar) {
      return NextResponse.json(
        { error: "الاسم العربي، المدة والسعر مطلوبة" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("services").insert({
      name_ar,
      name_en: name_en ?? "",
      description_ar: description_ar ?? "",
      duration_min,
      price_sar,
      image_url: image_url ?? null,
      category: category ?? "",
      active: active ?? true,
      display_order: display_order ?? 0,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "خطأ غير متوقع أثناء إنشاء الخدمة" },
      { status: 500 }
    );
  }
}
