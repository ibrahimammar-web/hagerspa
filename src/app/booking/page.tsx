"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Service } from "@/types/database.types";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";


export default function BookingPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);


  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchServices() {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true });

      if (data) setServices(data);
      setLoading(false);
    }
    fetchServices();
  }, []);

  const toggleService = (id: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedServices(newSelected);
  };

  const selectedServicesData = services.filter((s) =>
    selectedServices.has(s.id)
  );

  const totalPrice = selectedServicesData.reduce(
    (sum, s) => sum + s.price_sar,
    0
  );

  const totalDuration = selectedServicesData.reduce(
    (sum, s) => sum + s.duration_min,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[#8b7355]">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#8b7355] hover:text-[#e8b4b8] mb-4"
          >
            <ArrowRight size={20} />
            العودة للرئيسية
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2d2424]">
            اختاري الخدمات
          </h1>
          <p className="text-[#8b7355] mt-2">
            اختاري الخدمات اللي تناسبك وشوفي الإجمالي مباشرة
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {services.map((service) => {
            const isSelected = selectedServices.has(service.id);
            return (
              <button
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`card p-5 text-right transition-all ${
                  isSelected
                    ? "ring-2 ring-[#e8b4b8] bg-[#fef7f8]"
                    : "hover:ring-1 hover:ring-gray-300"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#2d2424] mb-1">
                      {service.name_ar}
                    </h3>
                    <p className="text-sm text-[#8b7355] line-clamp-2">
                      {service.description_ar}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
                      isSelected
                        ? "bg-[#e8b4b8] border-[#e8b4b8]"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check size={16} className="text-white" />}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-[#d4af37] text-lg">
                    {service.price_sar} ر.س
                  </span>
                  <span className="text-gray-500">
                    {service.duration_min} دقيقة
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Summary Card */}
        {selectedServices.size > 0 && (
          <div className="card p-6 sticky bottom-4 bg-white shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-[#2d2424]">
              ملخص الحجز
            </h3>
            <div className="space-y-2 mb-4">
              {selectedServicesData.map((service) => (
                <div
                  key={service.id}
                  className="flex justify-between text-sm"
                >
                  <span>{service.name_ar}</span>
                  <span className="font-semibold">{service.price_sar} ر.س</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between font-bold text-lg">
                <span>الإجمالي</span>
                <span className="text-[#d4af37]">{totalPrice} ر.س</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>المدة الإجمالية</span>
                <span>{totalDuration} دقيقة</span>
              </div>
            </div>
            <button
  type="button"
  disabled={selectedServices.size === 0}
  className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
  onClick={() => {
    if (selectedServices.size === 0) return;
    const ids = Array.from(selectedServices).join(",");
    router.push(`/booking/step-2?services=${ids}`);
  }}
>
  التالي: اختيار الأخصائية والموعد
</button>

          </div>
        )}

        {selectedServices.size === 0 && (
          <div className="text-center py-12 text-[#8b7355]">
            اختاري خدمة أو أكثر للمتابعة
          </div>
        )}
      </div>
    </div>
  );
}
