import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

export default async function SpecialistsPage() {
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

  const { data: specialists, error } = await supabase
    .from("specialists")
    .select("id, name, phone, email, active, display_order")
    .order("display_order", { ascending: true });

  if (error) {
    return (
      <div className="p-4 text-red-600">
        حدث خطأ أثناء تحميل الأخصائيات: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">الأخصائيات</h1>
        <Link
          href="/admin/specialists/new"
          className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
        >
          إضافة أخصائية
        </Link>
      </div>

      <table className="min-w-full text-sm border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-right">الترتيب</th>
            <th className="px-3 py-2 text-right">الاسم</th>
            <th className="px-3 py-2 text-right">الهاتف</th>
            <th className="px-3 py-2 text-right">البريد</th>
            <th className="px-3 py-2 text-right">مفعّلة؟</th>
            <th className="px-3 py-2 text-right">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {specialists?.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="px-3 py-2">{s.display_order}</td>
              <td className="px-3 py-2">{s.name}</td>
              <td className="px-3 py-2">{s.phone}</td>
              <td className="px-3 py-2">{s.email}</td>
              <td className="px-3 py-2">{s.active ? "نعم" : "لا"}</td>
              <td className="px-3 py-2">
                <Link
                  href={`/admin/specialists/${s.id}`}
                  className="text-blue-600 hover:underline"
                >
                  تعديل
                </Link>
              </td>
            </tr>
          ))}
          {specialists?.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-center text-gray-500" colSpan={6}>
                لا توجد أخصائيات حالياً
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
