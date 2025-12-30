import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // admin
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  // نتحقق أن الحجز موجود وحالته تسمح بالإلغاء
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("id, status, booking_date, start_time")
    .eq("id", id)
    .maybeSingle();

  if (error || !booking) {
    return NextResponse.json(
      { error: "الحجز غير موجود" },
      { status: 404 }
    );
  }

  if (
    booking.status !== "pending_payment" &&
    booking.status !== "confirmed"
  ) {
    return NextResponse.json(
      { error: "لا يمكن إلغاء هذا الحجز" },
      { status: 400 }
    );
  }

  // (اختياري) تحقق أن الموعد في المستقبل

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: "تعذر إلغاء الحجز" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
