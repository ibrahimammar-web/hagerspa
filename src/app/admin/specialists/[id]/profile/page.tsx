import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import Image from "next/image";

type Params = Promise<{ id: string }>;

export default async function SpecialistProfilePage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
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
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // جلب بيانات الأخصائية
  const { data: specialist, error: specialistError } = await supabase
    .from("specialists")
    .select("*")
    .eq("id", id)
    .single();

  if (specialistError || !specialist) {
    return (
      <div className="p-6 text-red-600">
        تعذر تحميل بيانات الأخصائية.
      </div>
    );
  }

  // جلب الخدمات المرتبطة بالأخصائية
  const { data: services } = await supabase
    .from("specialist_services")
    .select("services(id, name_ar, price_sar)")
    .eq("specialist_id", id);

  // جلب الحجوزات المرتبطة بالأخصائية
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, booking_date, booking_time, status, customer_name")
    .eq("specialist_id", id)
    .order("booking_date", { ascending: false })
    .limit(10);

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">ملف الأخصائية</h1>
        <Link
          href={`/admin/specialists/${id}`}
          className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
        >
          تعديل البيانات
        </Link>
      </div>

      {/* معلومات الأخصائية */}
      <div className="border rounded-lg p-6 bg-white space-y-4">
        <div className="flex items-start gap-6">
          {specialist.avatar_url && (
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
              <Image
                src={specialist.avatar_url}
                alt={specialist.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">{specialist.name}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">الهاتف:</span>{" "}
                <span className="font-medium">{specialist.phone || "-"}</span>
              </div>
              <div>
                <span className="text-gray-600">البريد:</span>{" "}
                <span className="font-medium">{specialist.email || "-"}</span>
              </div>
              <div>
                <span className="text-gray-600">الحالة:</span>{" "}
                <span
                  className={`font-medium ${
                    specialist.active ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {specialist.active ? "مفعّلة" : "غير مفعّلة"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">ترتيب العرض:</span>{" "}
                <span className="font-medium">
                  {specialist.display_order || "-"}
                </span>
              </div>
            </div>
            {specialist.bio_ar && (
              <div className="mt-4">
                <p className="text-gray-600 text-sm">الوصف:</p>
                <p className="mt-1">{specialist.bio_ar}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* الخدمات التي تقدمها */}
      <div className="border rounded-lg p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">الخدمات المقدمة</h3>
          <Link
            href={`/admin/specialists/${id}/services`}
            className="text-blue-600 text-sm hover:underline"
          >
            إدارة الخدمات
          </Link>
        </div>
        {services && services.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {services.map((item: any) => (
              <div
                key={item.services.id}
                className="border rounded p-3 text-sm"
              >
                <div className="font-medium">{item.services.name_ar}</div>
                <div className="text-gray-600 text-xs mt-1">
                  {item.services.price_sar} ر.س
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            لم يتم ربط أي خدمة بهذه الأخصائية بعد.
          </p>
        )}
      </div>

      {/* آخر الحجوزات */}
      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4">آخر الحجوزات</h3>
        {bookings && bookings.length > 0 ? (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-right">اسم العميل</th>
                <th className="px-3 py-2 text-right">التاريخ</th>
                <th className="px-3 py-2 text-right">الوقت</th>
                <th className="px-3 py-2 text-right">الحالة</th>
                <th className="px-3 py-2 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking: any) => (
                <tr key={booking.id} className="border-t">
                  <td className="px-3 py-2">{booking.customer_name}</td>
                  <td className="px-3 py-2">{booking.booking_date}</td>
                  <td className="px-3 py-2">{booking.booking_time}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      عرض
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-sm">
            لا توجد حجوزات لهذه الأخصائية.
          </p>
        )}
      </div>
    </div>
  );
}
