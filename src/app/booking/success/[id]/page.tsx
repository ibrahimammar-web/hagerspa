import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";

interface SuccessBookingRow {
  id: string;
  customer_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  specialists: { name: string }[] | null;
}

export default async function BookingSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      customer_name,
      booking_date,
      start_time,
      end_time,
      specialists ( name )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return notFound();
  }

  const booking = data as SuccessBookingRow;

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow rounded-2xl p-6 space-y-4 text-center">
        <h1 className="text-2xl font-bold text-[#2d2424]">تم تأكيد حجزك 🎉</h1>
        <p className="text-[#8b7355] text-sm">
          شكراً {booking.customer_name}، تم استلام حجزك بنجاح.
        </p>

        <div className="bg-[#faf8f5] rounded-xl p-4 text-right text-sm space-y-2">
          <div>
            <span className="text-gray-500">رقم الحجز:</span>{" "}
            <span className="font-semibold">{booking.id}</span>
          </div>
          <div>
            <span className="text-gray-500">التاريخ:</span>{" "}
            {new Date(booking.booking_date).toLocaleDateString("ar-SA")}
          </div>
          <div>
            <span className="text-gray-500">الوقت:</span>{" "}
            {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
          </div>
          <div>
            <span className="text-gray-500">الأخصائية:</span>{" "}
            {booking.specialists?.[0]?.name || "-"}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <Link
            href="/"
            className="w-full py-2 rounded-lg bg-[#d4af37] text-[#2d2424] font-semibold"
          >
            الرجوع للصفحة الرئيسية
          </Link>
          <Link
            href={`/bookings/track?phone=`}
            className="w-full py-2 rounded-lg border border-gray-300 text-sm text-gray-700"
          >
            متابعة حجوزاتك
          </Link>
        </div>
      </div>
    </div>
  );
}
