import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

export default async function ServicesPage() {
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

  const { data: services, error } = await supabase
    .from("services")
    .select(
      "id, name_ar, name_en, duration_min, price_sar, category, active, display_order"
    )
    .order("display_order", { ascending: true });

  if (error) {
    return (
      <div className="p-4 text-red-600">
        حدث خطأ أثناء تحميل الخدمات: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">الخدمات</h1>
        <Link
          href="/admin/services/new"
          className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
        >
          إضافة خدمة
        </Link>
      </div>

      <table className="min-w-full text-sm border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-right">الترتيب</th>
            <th className="px-3 py-2 text-right">الاسم (عربي)</th>
            <th className="px-3 py-2 text-right">الاسم (إنجليزي)</th>
            <th className="px-3 py-2 text-right">الفئة</th>
            <th className="px-3 py-2 text-right">المدة (دقيقة)</th>
            <th className="px-3 py-2 text-right">السعر (ر.س)</th>
            <th className="px-3 py-2 text-right">مفعّلة؟</th>
            <th className="px-3 py-2 text-right">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {services?.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="px-3 py-2">{s.display_order}</td>
              <td className="px-3 py-2">{s.name_ar}</td>
              <td className="px-3 py-2">{s.name_en}</td>
              <td className="px-3 py-2">{s.category}</td>
              <td className="px-3 py-2">{s.duration_min}</td>
              <td className="px-3 py-2">{s.price_sar}</td>
              <td className="px-3 py-2">{s.active ? "نعم" : "لا"}</td>
              <td className="px-3 py-2">
                <Link
                  href={`/admin/services/${s.id}`}
                  className="text-blue-600 hover:underline"
                >
                  تعديل
                </Link>
              </td>
            </tr>
          ))}
          {services?.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-center text-gray-500" colSpan={8}>
                لا توجد خدمات حالياً
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
