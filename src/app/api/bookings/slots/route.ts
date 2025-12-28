import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const specialistId = req.nextUrl.searchParams.get("specialist_id");
  const date = req.nextUrl.searchParams.get("date");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // حساب day_of_week من التاريخ
  const dayOfWeek = new Date(date!).getDay();

  const { data: schedules } = await supabase
    .from("specialist_schedules")
    .select("start_time, end_time")
    .eq("specialist_id", specialistId)
    .eq("day_of_week", dayOfWeek)
    .eq("is_available", true);

  // تحويل الـ schedules إلى slots بسيطة (مثلاً كل ساعة)
  const slots =
    schedules?.map((s: any) => ({
      time: s.start_time,
    })) || [];

  return NextResponse.json({ slots });
}
