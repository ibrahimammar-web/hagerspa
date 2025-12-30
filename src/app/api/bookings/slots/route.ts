import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    const { searchParams } = new URL(req.url);
    const specialistId = searchParams.get("specialist_id");
    const date = searchParams.get("date"); // "2025-12-30"
    const serviceId = searchParams.get("service_id");

    if (!specialistId || !date || !serviceId) {
      return NextResponse.json(
        { error: "specialist_id و date و service_id مطلوبة" },
        { status: 400 }
      );
    }

    // 0) جلب مدة الخدمة من جدول الخدمات
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("duration_min")
      .eq("id", serviceId)
      .maybeSingle();

    if (serviceError || !service) {
      return NextResponse.json(
        { error: serviceError?.message || "لم يتم العثور على الخدمة" },
        { status: 400 }
      );
    }

    const SLOT_DURATION = service.duration_min; // 👈 مدة الخدمة الفعلية (بالدقائق)

    // 1) حساب day_of_week من التاريخ
    const d = new Date(date + "T00:00:00");
    const dayOfWeek = d.getDay(); // 0-6 (تأكد أنه يطابق ما في specialist_schedule)

    // 2) جلب دوام الأخصائية في هذا اليوم
    const { data: schedules, error: scheduleError } = await supabase
      .from("specialist_schedule")
      .select("start_time, end_time")
      .eq("specialist_id", specialistId)
      .eq("day_of_week", dayOfWeek)
      .eq("is_available", true);

    if (scheduleError) {
      return NextResponse.json(
        { error: scheduleError.message },
        { status: 500 }
      );
    }

    if (!schedules || schedules.length === 0) {
      return NextResponse.json({ slots: [] }, { status: 200 });
    }

    // نفترض فترة واحدة؛ لو عندك أكثر من فترة في نفس اليوم يمكن تكرار المنطق
    const schedule = schedules[0];

    // 3) جلب الحجوزات الحالية لليوم
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("start_time, end_time")
      .eq("specialist_id", specialistId)
      .eq("booking_date", date);

    if (bookingsError) {
      return NextResponse.json(
        { error: bookingsError.message },
        { status: 500 }
      );
    }

    // Helper لتحويل "HH:MM:SS" إلى دقائق
    const timeToMinutes = (t: string) => {
      const [h, m] = t.split(":").map((x) => parseInt(x, 10));
      return h * 60 + m;
    };

    const scheduleStart = timeToMinutes(schedule.start_time); // مثل 12:00
    const scheduleEnd = timeToMinutes(schedule.end_time);     // مثل 22:00

    const bookedRanges =
      bookings?.map((b) => ({
        start: timeToMinutes(b.start_time),
        end: timeToMinutes(b.end_time),
      })) || [];

    const slots: { time: string }[] = [];

    for (
      let start = scheduleStart;
      start + SLOT_DURATION <= scheduleEnd;
      start += SLOT_DURATION
    ) {
      const end = start + SLOT_DURATION;

      // تحقق من عدم التعارض مع أي حجز
      const overlaps = bookedRanges.some(
        (b) => b.start < end && b.end > start
      );
      if (overlaps) continue;

      const h = Math.floor(start / 60);
      const m = start % 60;
      const label = `${String(h).padStart(2, "0")}:${String(m).padStart(
        2,
        "0"
      )}`;

      slots.push({ time: label });
    }

    return NextResponse.json({ slots }, { status: 200 });
  } catch (err: any) {
    console.error("slots error", err);
    return NextResponse.json(
      { error: "Unexpected error while fetching slots" },
      { status: 500 }
    );
  }
}
