import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    // ✅ فك الـ Promise
    const { id } = await context.params;

    const body = await req.json();
    const { status } = body as { status?: string };

    if (
      !status ||
      ![
        "pending_payment",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
      ].includes(status)
    ) {
      return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select("id, specialist_id, status")
      .single();

    console.log("BOOKINGS_UPDATE_RESULT", { data, error });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("BOOKINGS_PATCH_ERROR", e);
    return NextResponse.json(
      { error: "خطأ غير متوقع أثناء تحديث الحالة" },
      { status: 500 }
    );
  }
}
