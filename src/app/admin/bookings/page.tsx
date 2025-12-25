import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

interface RawBookingRow {
  id: string;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: string;
  specialist: { name: string }[] | null;
}

interface BookingRow {
  id: string;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: string;
  specialist_id: string | null;
  specialist_name: string | null;
  notes: string | null;
}



export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const supabase = await createSupabaseServerClient();

  // ✅ نجلب الحجوزات مع الأخصائية (alias specialist)
   const { data: bookingsData, error: bookingsError } = await supabase
  .from("bookings")
  .select(
    `
    id,
    customer_name,
    customer_phone,
    booking_date,
    start_time,
    end_time,
    total_amount,
    status,
    specialist_id,
    notes
  `
  )
  .order("booking_date", { ascending: false })
  .order("start_time", { ascending: false });


  // 2) جلب كل الأخصائيات في خريطة id -> name
  const { data: specialistsData, error: specialistsError } = await supabase
    .from("specialists")
    .select("id, name");

  const specialistsMap = new Map<string, string>();
  (specialistsData || []).forEach((s) => {
    specialistsMap.set(s.id, s.name);
  });

  const bookings: BookingRow[] = (bookingsData || []).map((b: any) => ({
  id: b.id,
  customer_name: b.customer_name,
  customer_phone: b.customer_phone,
  booking_date: b.booking_date,
  start_time: b.start_time,
  end_time: b.end_time,
  total_amount: b.total_amount,
  status: b.status,
  specialist_id: b.specialist_id,
  specialist_name: b.specialist_id
    ? specialistsMap.get(b.specialist_id) || null
    : null,
  notes: b.notes ?? null,
}));

  const error = bookingsError || specialistsError || null;

  return (
    <div className="min-h-screen bg-[#faf8f5] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2d2424]">
              لوحة الحجوزات
            </h1>
            <p className="text-[#8b7355] mt-1">
              عرض الحجوزات التي تمت من خلال الموقع
            </p>
          </div>
          <Link href="/" className="btn-secondary">
            العودة للموقع
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-3 py-2 rounded mb-4">
            حدث خطأ أثناء تحميل الحجوزات: {error.message}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="card p-6 text-center text-[#8b7355]">
            لا توجد حجوزات حتى الآن
          </div>
        ) : (
          <div className="card p-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                    <tr className="text-right text-sm text-gray-600">
                        <th className="px-3 py-1">التاريخ</th>
                        <th className="px-3 py-1">الوقت</th>
                        <th className="px-3 py-1">العميلة</th>
                        <th className="px-3 py-1">الجوال</th>
                        <th className="px-3 py-1">الأخصائية</th>
                        <th className="px-3 py-1">المبلغ</th>
                        <th className="px-3 py-1">الملاحظات</th>
                        <th className="px-3 py-1">الحالة</th>
                    </tr>
                </thead>

              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="bg-white hover:bg-[#fef7f8] text-sm rounded-xl"
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(b.booking_date).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}
                    </td>
                    <td className="px-3 py-2">{b.customer_name}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <a
                        href={`tel:${b.customer_phone}`}
                        className="text-[#e8b4b8] hover:underline"
                      >
                        {b.customer_phone}
                      </a>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {b.specialist_name || "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                        {b.total_amount} ر.س
                    </td>
                    <td className="px-3 py-2">
                    {b.notes || "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                    <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        b.status === "pending_payment"
                            ? "bg-yellow-50 text-yellow-700"
                            : b.status === "confirmed"
                            ? "bg-green-50 text-green-700"
                            : b.status === "cancelled"
                            ? "bg-red-50 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {translateStatus(b.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function translateStatus(status: string): string {
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