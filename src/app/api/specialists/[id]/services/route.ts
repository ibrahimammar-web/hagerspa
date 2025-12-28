import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type Params = Promise<{ id: string }>;

export async function POST(req: NextRequest, context: { params: Params }) {
  try {
    const { id: specialistId } = await context.params;
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

    const { service_ids } = (await req.json()) as { service_ids: string[] };

    // حذف الربط القديم
    await supabase
      .from("specialist_services")
      .delete()
      .eq("specialist_id", specialistId);

    // إضافة الربط الجديد
    if (service_ids && service_ids.length > 0) {
      const rows = service_ids.map((serviceId) => ({
        specialist_id: specialistId,
        service_id: serviceId,
      }));

      const { error } = await supabase
        .from("specialist_services")
        .insert(rows);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
