import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import EditSpecialistForm from "./EditSpecialistForm";

type Params = Promise<{ id: string }>;

export default async function SpecialistEditPage({
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

  const { data: specialist, error } = await supabase
    .from("specialists")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !specialist) {
    return (
      <div className="p-6 text-red-600">
        تعذر تحميل بيانات الأخصائية المطلوبة.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-semibold mb-4">تعديل الأخصائية</h1>
      <EditSpecialistForm specialist={specialist} />
    </div>
  );
}
