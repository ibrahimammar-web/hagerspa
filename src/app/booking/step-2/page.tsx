import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Service, Specialist } from "@/types/database.types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SearchParams {
  services?: string;
}

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function BookingStep2Page({ searchParams }: Props) {
  // ✅ في Next 16 لازم نعمل await
  const { services: servicesParam } = await searchParams;

  if (!servicesParam) {
    return notFound();
  }

  const serviceIds = servicesParam.split(",").filter(Boolean);
  if (serviceIds.length === 0) {
    return notFound();
  }

  const supabase = await createSupabaseServerClient();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .in("id", serviceIds);

  if (!services || services.length === 0) {
    return notFound();
  }

  const { data: specialists } = await supabase
    .from("specialists")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true });

  const totalDuration = services.reduce(
    (sum, s) => sum + s.duration_min,
    0
  );
  const totalPrice = services.reduce((sum, s) => sum + s.price_sar, 0);

  return (
    <div className="min-h-screen bg-[#faf8f5] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 text-[#8b7355] hover:text-[#e8b4b8] mb-4"
          >
            <ArrowRight size={20} />
            الرجوع لاختيار الخدمات
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2d2424]">
            اختاري الأخصائية والموعد
          </h1>
          <p className="text-[#8b7355] mt-2">
            إجمالي مدة جلستك تقريبًا {totalDuration} دقيقة، بمبلغ {totalPrice} ر.س
          </p>
        </div>

        {/* Selected services summary */}
        <div className="card p-4 mb-6">
          <h2 className="font-bold mb-3 text-[#2d2424]">الخدمات المختارة</h2>
          <ul className="list-disc pr-5 text-[#8b7355] space-y-1">
            {services.map((s: Service) => (
              <li key={s.id}>
                {s.name_ar} – {s.price_sar} ر.س ({s.duration_min} دقيقة)
              </li>
            ))}
          </ul>
        </div>

        {/* Specialists list (اختيار الأخصائية فقط الآن) */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-[#2d2424]">
            اختاري الأخصائية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specialists?.map((spec: Specialist) => (
              <div key={spec.id} className="card p-4 flex flex-col gap-2">
                <h3 className="text-lg font-bold text-[#2d2424]">
                  {spec.name}
                </h3>
                <p className="text-sm text-[#8b7355] line-clamp-2">
                  {spec.bio_ar}
                </p>
                <Link
                    href={`/booking/step-3?services=${serviceIds.join(",")}&specialist=${spec.id}`}
                    className="btn-secondary mt-2 text-center"
                    >
                    اختيار {spec.name.split(" ")[0]}
                    </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Placeholder للموعد (سنفصّله في خطوة لاحقة) */}
        <div className="card p-4">
          <h2 className="text-xl font-bold mb-3 text-[#2d2424]">
            اختيار اليوم والوقت (قريبًا)
          </h2>
          <p className="text-[#8b7355] text-sm">
            في الخطوة الجاية سنربط جدول الدوام specialist_schedules مع الحجوزات
            لعرض الأوقات المتاحة فقط بناءً على مدة جلستك.
          </p>
        </div>
      </div>
    </div>
  );
}

