import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ params كـ Promise
) {
  try {
    const { id } = await params; // ✅ ضروري

    // استخدام Service Role (اختياري لكن أنسب مع RLS)
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

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        customer_name,
        booking_date,
        start_time,
        total_amount,
        specialist_id
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (error || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    let specialist_name: string | null = null;

    if (booking.specialist_id) {
      const { data: specialist } = await supabase
        .from("specialists")
        .select("name")
        .eq("id", booking.specialist_id)
        .maybeSingle();

      specialist_name = specialist?.name ?? null;
    }

    return NextResponse.json({
      customer_name: booking.customer_name,
      booking_date: booking.booking_date,
      start_time: booking.start_time,
      total_amount: booking.total_amount,
      specialist_name,
    });
  } catch (err: any) {
    console.error("Get booking error:", err);
    return NextResponse.json(
      { error: "Unexpected error while fetching booking" },
      { status: 500 }
    );
  }
}
