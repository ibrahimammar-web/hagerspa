import { StatusButtons } from "@/components/StatusButtons";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";

interface BookingDetails {
  id: string;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: string;
  notes: string | null;
  specialist: { id: string; name: string } | null;
  services: {
    id: string;
    service_id: string;
    service_name_ar: string;
    duration_min: number;
    price_sar: number;
  }[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

interface StatusButtonsProps {
  bookingId: string;
  currentStatus: string;
}

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;

  // ✅ Service Role client لتجاوز RLS
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

  // 1) جلب الحجز نفسه
  const { data: bookingData, error: bookingError } = await supabase
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
      notes,
      specialist_id
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (bookingError || !bookingData) {
    return notFound();
  }

  let specialist = null;

  if (bookingData.specialist_id) {
    const { data: specialistData } = await supabase
      .from("specialists")
      .select("id, name")
      .eq("id", bookingData.specialist_id)
      .maybeSingle();

    specialist = specialistData;
  }

  // 2) جلب الخدمات داخل الحجز
  const { data: bookingServices, error: bsError } = await supabase
    .from("booking_services")
    .select(
      `
      id,
      service_id,
      service_name_ar,
      duration_min,
      price_sar
    `
    )
    .eq("booking_id", id)
    .order("created_at", { ascending: true });

  const booking: BookingDetails = {
    id: bookingData.id,
    customer_name: bookingData.customer_name,
    customer_phone: bookingData.customer_phone,
    booking_date: bookingData.booking_date,
    start_time: bookingData.start_time,
    end_time: bookingData.end_time,
    total_amount: bookingData.total_amount,
    status: bookingData.status,
    notes: bookingData.notes,
    specialist: specialist,
    services: (bookingServices || []) as BookingDetails["services"],
  };

  const totalDuration = booking.services.reduce(
    (sum, s) => sum + s.duration_min,
    0
  );

  return (
    <div className="min-h-screen bg-[#faf8f5] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#2d2424]">
              تفاصيل الحجز
            </h1>
            <p className="text-[#8b7355] mt-1 text-sm">
              رقم الحجز: {booking.id}
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="btn-secondary text-sm md:text-base"
          >
            الرجوع لقائمة الحجوزات
          </Link>
        </div>

        {/* Booking summary */}
        <div className="card p-5 mb-6 space-y-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <div>
              <div className="text-sm text-gray-500">العميلة</div>
              <div className="font-semibold text-[#2d2424]">
                {booking.customer_name}
              </div>
              <a
                href={`tel:${booking.customer_phone}`}
                className="text-sm text-[#e8b4b8] hover:underline"
              >
                {booking.customer_phone}
              </a>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">التاريخ والوقت</div>
              <div className="font-semibold">
                {new Date(booking.booking_date).toLocaleDateString("ar-SA")}{" "}
                | {booking.start_time.slice(0, 5)} -{" "}
                {booking.end_time.slice(0, 5)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div>
              <div className="text-sm text-gray-500">الأخصائية</div>
              <div className="font-semibold">
                {booking.specialist?.name || "-"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">المبلغ الإجمالي</div>
              <div className="font-semibold text-[#d4af37]">
                {booking.total_amount} ر.س
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">المدة الإجمالية</div>
              <div className="font-semibold">{totalDuration} دقيقة</div>
            </div>
          </div>

          {booking.notes && (
            <div className="mt-3">
              <div className="text-sm text-gray-500 mb-1">ملاحظات العميلة</div>
              <div className="text-sm text-[#2d2424] bg-[#fef7f8] rounded-lg p-3">
                {booking.notes}
              </div>
            </div>
          )}

          <div className="mt-3">
            <div className="text-sm text-gray-500 mb-1">الحالة الحالية</div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                booking.status === "pending_payment"
                  ? "bg-yellow-50 text-yellow-700"
                  : booking.status === "confirmed"
                  ? "bg-green-50 text-green-700"
                  : booking.status === "cancelled"
                  ? "bg-red-50 text-red-700"
                  : booking.status === "completed"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {translateStatus(booking.status)}
            </span>

            <StatusButtons bookingId={booking.id} currentStatus={booking.status} />
          </div>
        </div>

        {/* Services list */}
        <div className="card p-5">
          <h2 className="text-lg font-bold mb-3 text-[#2d2424]">
            الخدمات في هذا الحجز
          </h2>
          {booking.services.length === 0 ? (
            <p className="text-sm text-[#8b7355]">لا توجد خدمات مرتبطة.</p>
          ) : (
            <div className="space-y-2">
              {booking.services.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between text-sm bg-[#faf8f5] rounded-lg px-3 py-2"
                >
                  <div>
                    <div className="font-semibold text-[#2d2424]">
                      {s.service_name_ar}
                    </div>
                    <div className="text-xs text-gray-500">
                      المدة: {s.duration_min} دقيقة
                    </div>
                  </div>
                  <div className="font-semibold text-[#d4af37]">
                    {s.price_sar} ر.س
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
