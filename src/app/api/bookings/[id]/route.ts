import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const { id } = params;

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
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
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
}
