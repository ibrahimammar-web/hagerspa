import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  // استخدام Service Role بدلاً من anon
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // تأكد من هذا السطر
  );

  const {
    service_id,
    specialist_id,
    booking_date,
    booking_time,
    customer_name,
    customer_phone,
    customer_email,
  } = await req.json();

  // إنشاء الحجز
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      specialist_id,
      booking_date,
      booking_time,
      customer_name,
      customer_phone,
      customer_email: customer_email || null,
      status: "pending",
    })
    .select()
    .single();

  if (bookingError || !booking) {
    return NextResponse.json(
      { error: bookingError?.message || "فشل إنشاء الحجز" },
      { status: 500 }
    );
  }

  // إضافة الخدمة للحجز
  const { data: selectedService } = await supabase
    .from("services")
    .select("price_sar")
    .eq("id", service_id)
    .single();

  await supabase.from("booking_services").insert({
    booking_id: booking.id,
    service_id,
    price: selectedService?.price_sar || 0,
  });

  return NextResponse.json({ success: true, booking_id: booking.id });
}
