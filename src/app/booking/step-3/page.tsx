"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Service } from "@/types/database.types";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface BookingFormData {
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  start_time: string;
  notes: string;
}

export default function BookingStep3Page() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const servicesParam = searchParams.get("services");
  const specialistId = searchParams.get("specialist");

  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<BookingFormData>({
    customer_name: "",
    customer_phone: "",
    booking_date: "",
    start_time: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchServices() {
      if (!servicesParam) {
        setLoadingServices(false);
        return;
      }
      const ids = servicesParam.split(",").filter(Boolean);
      if (ids.length === 0) {
        setLoadingServices(false);
        return;
      }
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .in("id", ids);

      if (error) {
        console.error(error);
        setError("تعذر تحميل الخدمات المختارة");
      } else if (data) {
        setServices(data);
      }
      setLoadingServices(false);
    }

    fetchServices();
  }, [servicesParam]);

  const totalPrice = services.reduce(
    (sum, s) => sum + s.price_sar,
    0
  );
  const totalDuration = services.reduce(
    (sum, s) => sum + s.duration_min,
    0
  );

  if (!servicesParam || !specialistId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-[#8b7355]">
            البيانات غير مكتملة، عودي لاختيار الخدمات والأخصائية.
          </p>
          <Link href="/booking" className="btn-primary">
            الرجوع لصفحة الحجز
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!form.customer_name || !form.customer_phone || !form.booking_date || !form.start_time) {
      setError("فضلاً املئي جميع الحقول المطلوبة");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        booking_date: form.booking_date, // مثال: 2025-12-25
        start_time: form.start_time,     // مثال: 18:00
        notes: form.notes,
        specialist_id: specialistId,
        services: services.map((s) => ({
          id: s.id,
          name_ar: s.name_ar,
          duration_min: s.duration_min,
          price_sar: s.price_sar,
        })),
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "تعذر إنشاء الحجز، حاولي مرة أخرى");
      } else {
        setSuccessMsg("تم تسجيل طلب الحجز بنجاح!");
         if (data.booking_id) {
    router.push(`/booking/success?id=${data.booking_id}`);
  }
      }
    } catch (err) {
      console.error(err);
      setError("حدث خطأ غير متوقع، حاولي مرة أخرى");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/booking/step-2?services=${servicesParam}`}
            className="inline-flex items-center gap-2 text-[#8b7355] hover:text-[#e8b4b8] mb-4"
          >
            <ArrowRight size={20} />
            الرجوع لاختيار الأخصائية
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2d2424]">
            تأكيد بيانات الحجز
          </h1>
          <p className="text-[#8b7355] mt-2">
            أدخلي بياناتك لإتمام طلب الحجز، وسيتم إرسال رابط الدفع لاحقًا.
          </p>
        </div>

        {/* Summary */}
        <div className="card p-4 mb-6">
          <h2 className="font-bold mb-3 text-[#2d2424]">ملخص الجلسة</h2>
          {loadingServices ? (
            <p className="text-[#8b7355]">جاري تحميل الخدمات...</p>
          ) : (
            <>
              <ul className="list-disc pr-5 text-[#8b7355] space-y-1 mb-3">
                {services.map((s) => (
                  <li key={s.id}>
                    {s.name_ar} – {s.price_sar} ر.س ({s.duration_min} دقيقة)
                  </li>
                ))}
              </ul>
              <div className="flex justify-between text-sm">
                <span>الإجمالي</span>
                <span className="font-bold text-[#d4af37]">
                  {totalPrice} ر.س
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>المدة الإجمالية</span>
                <span>{totalDuration} دقيقة</span>
              </div>
            </>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 px-3 py-2 rounded">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 text-green-700 px-3 py-2 rounded">
              {successMsg}
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm font-medium text-[#2d2424]">
              اسم العميلة *
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-[#e8b4b8]"
              value={form.customer_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, customer_name: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-[#2d2424]">
              رقم الجوال *
            </label>
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-[#e8b4b8]"
              value={form.customer_phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, customer_phone: e.target.value }))
              }
              placeholder="05XXXXXXXX"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-[#2d2424]">
                تاريخ الحجز *
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-[#e8b4b8]"
                value={form.booking_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, booking_date: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-[#2d2424]">
                وقت البداية *
              </label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-[#e8b4b8]"
                value={form.start_time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, start_time: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-[#2d2424]">
              ملاحظات (اختياري)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-[#e8b4b8]"
              rows={3}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading || services.length === 0}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "جاري إنشاء الحجز..." : "تأكيد الحجز"}
          </button>
        </form>
      </div>
    </div>
  );
}
