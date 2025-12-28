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

    const { day_of_week, start_time, end_time, is_available } =
      (await req.json()) as {
        day_of_week: number;
        start_time: string;
        end_time: string;
        is_available: boolean;
      };

    const { error } = await supabase.from("specialist_schedules").insert({
      specialist_id: specialistId,
      day_of_week,
      start_time,
      end_time,
      is_available: is_available ?? true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطأ غير متوقع" }, { status: 500 });
  }
}
