import { CancelBookingButton, type BookingStatus } from "./CancelBookingButton";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
interface TrackBookingRow {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  specialists: { name: string }[] | null;
  services: { service_name_ar: string }[] | null;
}
export default async function TrackBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const { phone } = await searchParams;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let bookings: any[] = [];

  if (phone) {
    const { data } = await supabase
      .from("bookings")
      .select(
        `
        id,
        booking_date,
        start_time,
        end_time,
        status,
        specialists ( name ),
        services: booking_services (
          service_name_ar
        )
      `
      )
      .eq("customer_phone", phone)
      .order("booking_date", { ascending: false })
      .order("start_time", { ascending: false });

    bookings = data || [];
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-[#2d2424] text-center">
          تتبع حجوزاتك
        </h1>

        <form className="card p-4 flex gap-2 justify-center" action="">
          <input
            type="tel"
            name="phone"
            defaultValue={phone || ""}
            placeholder="أدخل رقم جوالك"
            className="flex-1 border rounded-lg px-3 py-2 text-right"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#d4af37] text-[#2d2424] font-semibold"
          >
            عرض الحجوزات
          </button>
        </form>

        {phone && bookings.length === 0 && (
          <div className="card p-4 text-center text-sm text-[#8b7355]">
            لا توجد حجوزات مرتبطة بهذا الرقم.
          </div>
        )}

        {bookings.length > 0 && (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="card p-4 flex flex-col gap-2 text-sm bg-white"
              >
                <div className="flex justify-between">
                  <div>
                    <div className="text-gray-500">التاريخ</div>
                    <div className="font-semibold">
                      {new Date(b.booking_date).toLocaleDateString("ar-SA")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500">الوقت</div>
                    <div className="font-semibold">
                      {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div>
                    <div className="text-gray-500">الأخصائية</div>
                    <div className="font-semibold">
                      {b.specialists?.name || "-"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500">الحالة</div>
                    <div className="font-semibold">
                      {translateStatus(b.status)}
                    </div>
                  </div>
                </div>

                {b.services && b.services.length > 0 && (
                  <div className="text-xs text-gray-600">
                    الخدمات: {b.services.map((s: any) => s.service_name_ar).join("، ")}
                  </div>
                )}

                {/* مكان زر الإلغاء (لو متاح) */}
                <CancelBookingButton bookingId={b.id} status={b.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function translateStatus(status: string) {
  switch (status) {
    case "pending_payment":
      return "بانتظار الدفع";
    case "confirmed":
      return "مؤكد";
    case "cancelled":
      return "ملغي";
    case "completed":
      return "مكتمل";
    case "no_show":
      return "لم تحضر";
    default:
      return status;
  }
}
