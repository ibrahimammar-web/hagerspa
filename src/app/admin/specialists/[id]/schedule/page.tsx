import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import ScheduleManager from "./ScheduleManager";

type Params = Promise<{ id: string }>;

export default async function SpecialistSchedulePage({
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

  const { data: specialist } = await supabase
    .from("specialists")
    .select("id, name")
    .eq("id", id)
    .single();

  const { data: schedules } = await supabase
    .from("specialist_schedules")
    .select("*")
    .eq("specialist_id", id)
    .order("day_of_week")
    .order("start_time");

  if (!specialist) {
    return (
      <div className="p-6 text-red-600">تعذر تحميل بيانات الأخصائية.</div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-semibold mb-4">
        جدول دوام: {specialist.name}
      </h1>
      <ScheduleManager specialistId={id} initialSchedules={schedules || []} />
    </div>
  );
}
