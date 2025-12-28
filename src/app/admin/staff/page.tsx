import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

export default async function StaffPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

  const { data: staff, error } = await supabase
    .from("admin_users")
    .select("id, email, full_name, role, active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-4 text-red-600">
        حدث خطأ أثناء تحميل الموظفات: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">إدارة الموظفات</h1>
        <Link
          href="/admin/staff/new"
          className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
        >
          إضافة موظفة
        </Link>
      </div>

      <table className="min-w-full text-sm border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-right">الاسم</th>
            <th className="px-3 py-2 text-right">البريد الإلكتروني</th>
            <th className="px-3 py-2 text-right">الدور</th>
            <th className="px-3 py-2 text-right">مفعّلة؟</th>
            <th className="px-3 py-2 text-right">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {staff?.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="px-3 py-2">{s.full_name || "-"}</td>
              <td className="px-3 py-2">{s.email}</td>
              <td className="px-3 py-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    s.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {s.role}
                </span>
              </td>
              <td className="px-3 py-2">{s.active ? "نعم" : "لا"}</td>
              <td className="px-3 py-2">
                <Link
                  href={`/admin/staff/${s.id}`}
                  className="text-blue-600 hover:underline"
                >
                  تعديل
                </Link>
              </td>
            </tr>
          ))}
          {staff?.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-center text-gray-500" colSpan={5}>
                لا توجد موظفات حالياً
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
