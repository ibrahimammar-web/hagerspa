import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import ManageSpecialistServices from "./ManageSpecialistServices";

type Params = Promise<{ id: string }>;

export default async function SpecialistServicesPage({
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
  const { data: specialist } = await supabase
    .from("specialists")
    .select("id, name")
    .eq("id", id)
    .single();

  // جلب كل الخدمات
  const { data: allServices } = await supabase
    .from("services")
    .select("id, name_ar, price_sar")
    .eq("active", true)
    .order("name_ar");

  // جلب الخدمات المرتبطة حاليًا
  const { data: linkedServices } = await supabase
    .from("specialist_services")
    .select("service_id")
    .eq("specialist_id", id);

  const linkedServiceIds =
    linkedServices?.map((ls: any) => ls.service_id) || [];

  if (!specialist || !allServices) {
    return (
      <div className="p-6 text-red-600">حدث خطأ أثناء تحميل البيانات.</div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">
        إدارة خدمات: {specialist.name}
      </h1>
      <ManageSpecialistServices
        specialistId={id}
        allServices={allServices}
        linkedServiceIds={linkedServiceIds}
      />
    </div>
  );
}
