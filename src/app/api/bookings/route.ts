import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    // استخدام Service Role (يتجاوز RLS)
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

    const body = await req.json();

    const {
      customer_name,
      customer_phone,
      specialist_id,
      booking_date, // "2025-12-25"
      start_time,   // "18:00"
      services,     // [{ id, name_ar, duration_min, price_sar }]
      notes,
    } = body;

    if (
      !customer_name ||
      !customer_phone ||
      !specialist_id ||
      !booking_date ||
      !start_time ||
      !services ||
      !Array.isArray(services) ||
      services.length === 0
    ) {
      return NextResponse.json(
        { error: "بيانات الحجز غير مكتملة" },
        { status: 400 }
      );
    }

    const total_amount = services.reduce(
      (sum: number, s: any) => sum + Number(s.price_sar || 0),
      0
    );

    const total_duration = services.reduce(
      (sum: number, s: any) => sum + Number(s.duration_min || 0),
      0
    );

    // حساب end_time (بدون ثواني في المدخل، نضيف :00)
    const [hourStr, minStr] = start_time.split(":");
    const startMinutes = parseInt(hourStr) * 60 + parseInt(minStr);
    const endMinutes = startMinutes + total_duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const end_time = `${String(endHour).padStart(2, "0")}:${String(
      endMin
    ).padStart(2, "0")}:00`;

    // 1) إنشاء booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        customer_name,
        customer_phone,
        specialist_id,
        booking_date,
        start_time: `${start_time}:00`,
        end_time,
        total_amount,
        status: "pending_payment",
        notes: notes || null,
      })
      .select("*")
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: bookingError?.message || "تعذر إنشاء الحجز" },
        { status: 500 }
      );
    }

    // 2) إدخال booking_services
    const bookingServicesRows = services.map((s: any) => ({
      booking_id: booking.id,
      service_id: s.id,
      service_name_ar: s.name_ar,
      duration_min: s.duration_min,
      price_sar: s.price_sar,
    }));

    const { error: bsError } = await supabase
      .from("booking_services")
      .insert(bookingServicesRows);

    if (bsError) {
      return NextResponse.json(
        {
          error:
            bsError.message ||
            "تم إنشاء الحجز لكن فشل حفظ تفاصيل الخدمات",
        },
        { status: 500 }
      );
    }

    // TODO لاحقًا: إنشاء Payment Link من Geidea + إرجاع payment_url

    return NextResponse.json(
      {
        booking_id: booking.id,
        total_amount,
        total_duration,
        status: booking.status,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Create booking error:", err);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء إنشاء الحجز" },
      { status: 500 }
    );
  }
}
