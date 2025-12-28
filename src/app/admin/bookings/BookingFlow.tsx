"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name_ar: string;
  description_ar: string | null;
  price_sar: number;
  duration_min: number;
}

export default function BookingFlow({ services }: { services: Service[] }) {
  const router = useRouter();

  // الخطوات
  const [step, setStep] = useState(1);

  // بيانات الحجز
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedSpecialistId, setSelectedSpecialistId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // حالات التحميل
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // جلب الأخصائيات بناءً على الخدمة
  async function loadSpecialists(serviceId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/booking/specialists?service_id=${serviceId}`);
      const data = await res.json();
      setSpecialists(data.specialists || []);
    } catch {
      setError("تعذر تحميل الأخصائيات");
    } finally {
      setLoading(false);
    }
  }

  // جلب الـ Slots المتاحة
  async function loadSlots(specialistId: string, date: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/booking/slots?specialist_id=${specialistId}&date=${date}`
      );
      const data = await res.json();
      setAvailableSlots(data.slots || []);
    } catch {
      setError("تعذر تحميل الأوقات المتاحة");
    } finally {
      setLoading(false);
    }
  }

  // إرسال الحجز
  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: selectedServiceId,
          specialist_id: selectedSpecialistId,
          booking_date: selectedDate,
          booking_time: selectedTime,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر إنشاء الحجز");
      } else {
        alert("تم الحجز بنجاح!");
        router.push("/");
      }
    } catch {
      setError("حدث خطأ أثناء الحجز");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* الخطوة 1: اختيار الخدمة */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">اختر الخدمة</h2>
          <div className="space-y-3">
            {services.map((service) => (
              <label
                key={service.id}
                className={`block border rounded p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedServiceId === service.id ? "border-blue-600 bg-blue-50" : ""
                }`}
              >
                <input
                  type="radio"
                  name="service"
                  value={service.id}
                  checked={selectedServiceId === service.id}
                  onChange={(e) => {
                    setSelectedServiceId(e.target.value);
                    loadSpecialists(e.target.value);
                  }}
                  className="hidden"
                />
                <div className="font-medium">{service.name_ar}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {service.description_ar}
                </div>
                <div className="text-sm mt-2">
                  <span className="font-semibold">{service.price_sar} ر.س</span> •{" "}
                  {service.duration_min} دقيقة
                </div>
              </label>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!selectedServiceId}
            className="mt-4 px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      )}

      {/* الخطوة 2: اختيار الأخصائية */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">اختر الأخصائية</h2>
          {loading ? (
            <p>جارٍ التحميل...</p>
          ) : (
            <div className="space-y-3">
              {specialists.map((spec) => (
                <label
                  key={spec.id}
                  className={`block border rounded p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedSpecialistId === spec.id
                      ? "border-blue-600 bg-blue-50"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="specialist"
                    value={spec.id}
                    checked={selectedSpecialistId === spec.id}
                    onChange={(e) => setSelectedSpecialistId(e.target.value)}
                    className="hidden"
                  />
                  <div className="font-medium">{spec.name}</div>
                  {spec.bio_ar && (
                    <div className="text-sm text-gray-600 mt-1">{spec.bio_ar}</div>
                  )}
                </label>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded border"
            >
              السابق
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedSpecialistId}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {/* الخطوة 3: اختيار التاريخ والوقت */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">اختر التاريخ والوقت</h2>
          <div className="space-y-3">
            <div>
              <label className="block mb-1 text-sm">التاريخ</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  if (selectedSpecialistId && e.target.value) {
                    loadSlots(selectedSpecialistId, e.target.value);
                  }
                }}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            {selectedDate && (
              <div>
                <label className="block mb-1 text-sm">الوقت المتاح</label>
                {loading ? (
                  <p>جارٍ التحميل...</p>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`border rounded py-2 text-sm ${
                          selectedTime === slot.time
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    لا توجد أوقات متاحة في هذا اليوم
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded border"
            >
              السابق
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!selectedDate || !selectedTime}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {/* الخطوة 4: بيانات العميل */}
      {step === 4 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">أدخل بياناتك</h2>
          <div className="space-y-3">
            <div>
              <label className="block mb-1 text-sm">الاسم</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">رقم الجوال</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">البريد الإلكتروني</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded border"
            >
              السابق
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !customerName || !customerPhone}
              className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
            >
              {loading ? "جارٍ الحجز..." : "تأكيد الحجز"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
