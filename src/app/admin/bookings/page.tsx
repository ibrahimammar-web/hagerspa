import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

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

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    specialist?: string;
    date_from?: string;
    date_to?: string;
    page?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams; // ✅ await searchParams

  const supabase = await createSupabaseServerClient();

  // فلاتر من URL params ✅ بعد await
  const search = resolvedSearchParams.search || "";
  const status = resolvedSearchParams.status || "";
  const specialistId = resolvedSearchParams.specialist || "";
  const dateFrom = resolvedSearchParams.date_from || "";
  const dateTo = resolvedSearchParams.date_to || "";
  const page = parseInt(resolvedSearchParams.page || "1");

  // بناء query مع الفلاتر
  let query = supabase
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

  // فلترة بالبحث (اسم أو جوال)
  if (search) {
    query = query.or(`customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`);
  }

  // فلترة بالحالة
  if (status) {
    query = query.eq("status", status);
  }

  // فلترة بالتاريخ
  if (dateFrom) {
    query = query.gte("booking_date", dateFrom);
  }
  if (dateTo) {
    query = query.lte("booking_date", dateTo);
  }

  // فلترة بالأخصائية
  if (specialistId) {
    query = query.eq("specialist_id", specialistId);
  }

  const { data: bookingsData, error: bookingsError } = await query;

  // جلب الأخصائيات للفلترة
  const { data: specialistsData } = await supabase
    .from("specialists")
    .select("id, name")
    .eq("active", true)
    .order("display_order");

  const specialistsMap = new Map<string, string>();
  (specialistsData || []).forEach((s) => {
    specialistsMap.set(s.id, s.name!);
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
    specialist_name: b.specialist_id ? specialistsMap.get(b.specialist_id) || null : null,
    notes: b.notes ?? null,
  }));

  return (
    <div className="min-h-screen bg-[#faf8f5] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2d2424]">لوحة الحجوزات</h1>
            <p className="text-[#8b7355] mt-1">
              عرض الحجوزات التي تمت من خلال الموقع
            </p>
          </div>
          <Link href="/" className="btn-secondary">
            العودة للموقع
          </Link>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-6">
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" action="">
            {/* البحث */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البحث بالاسم أو الجوال
              </label>
              <input
                name="search"
                defaultValue={search}
                type="text"
                placeholder="اكتب اسم العميلة أو الجوال..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
              />
            </div>

            {/* فلترة بالحالة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الحالة
              </label>
              <select
                name="status"
                defaultValue={status}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37]"
              >
                <option value="">الكل</option>
                <option value="pending_payment">بانتظار الدفع</option>
                <option value="confirmed">مؤكد</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
                <option value="no_show">لم تحضر</option>
              </select>
            </div>

            {/* فلترة بالأخصائية */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الأخصائية
              </label>
              <select
                name="specialist"
                defaultValue={specialistId}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37]"
              >
                <option value="">الكل</option>
                {specialistsData?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* فلترة بالتاريخ */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                من تاريخ
              </label>
              <input
                name="date_from"
                defaultValue={dateFrom}
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37]"
              />
            </div>

            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                إلى تاريخ
              </label>
              <input
                name="date_to"
                defaultValue={dateTo}
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37]"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-4 flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 bg-[#d4af37] text-[#2d2424] font-semibold py-3 px-6 rounded-lg hover:bg-[#b8962e] transition-colors"
              >
                تصفية
              </button>
              <Link
                href="/admin/bookings"
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                مسح الفلاتر
              </Link>
            </div>
          </form>
        </div>

        {/* Results */}
        {bookingsError ? (
          <div className="bg-red-50 text-red-700 px-3 py-2 rounded mb-4">
            حدث خطأ أثناء تحميل الحجوزات: {bookingsError.message}
          </div>
        ) : bookings.length === 0 ? (
          <div className="card p-6 text-center text-[#8b7355]">
            لا توجد حجوزات مطابقة للفلاتر المختارة
          </div>
        ) : (
          <div className="card p-4 overflow-x-auto">
            <div className="text-sm text-gray-500 mb-2">
              تم العثور على {bookings.length} حجز
            </div>
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
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="text-[#2d2424] hover:underline"
                      >
                        {b.customer_name}
                      </Link>
                    </td>
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
                    <td className="px-3 py-2">{b.notes || "-"}</td>
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
