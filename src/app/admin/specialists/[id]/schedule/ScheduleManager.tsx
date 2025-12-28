"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Schedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const DAYS = [
  { value: 0, label: "الأحد" },
  { value: 1, label: "الاثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
  { value: 6, label: "السبت" },
];

export default function ScheduleManager({
  specialistId,
  initialSchedules,
}: {
  specialistId: string;
  initialSchedules: Schedule[];
}) {
  const router = useRouter();
  const [schedules, setSchedules] = useState(initialSchedules);
  const [showForm, setShowForm] = useState(false);

  // نموذج إضافة slot جديد
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddSlot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/specialists/${specialistId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_available: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر إضافة الـ Slot");
      } else {
        setShowForm(false);
        router.refresh();
      }
    } catch {
      setError("حدث خطأ أثناء الاتصال");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSlot(scheduleId: string) {
    if (!confirm("هل تريد حذف هذا الـ Slot؟")) return;

    try {
      const res = await fetch(
        `/api/specialists/${specialistId}/schedule/${scheduleId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        router.refresh();
      } else {
        alert("تعذر الحذف");
      }
    } catch {
      alert("حدث خطأ");
    }
  }

  // تجميع الـ slots حسب اليوم
  const schedulesByDay = DAYS.map((day) => ({
    day,
    slots: schedules.filter((s) => s.day_of_week === day.value),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          إدارة أوقات العمل الأسبوعية للأخصائية
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
        >
          {showForm ? "إلغاء" : "إضافة Slot جديد"}
        </button>
      </div>

      {/* نموذج إضافة slot */}
      {showForm && (
        <form
          onSubmit={handleAddSlot}
          className="border rounded-lg p-4 bg-gray-50 space-y-3"
        >
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 text-sm">اليوم</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm">من</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">إلى</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-green-600 text-white text-sm disabled:opacity-60"
          >
            {loading ? "جارٍ الإضافة..." : "إضافة"}
          </button>
        </form>
      )}

      {/* جدول الأوقات مجمّعة حسب اليوم */}
      <div className="border rounded-lg overflow-hidden">
        {schedulesByDay.map(({ day, slots }) => (
          <div key={day.value} className="border-b last:border-b-0">
            <div className="bg-gray-100 px-4 py-2 font-semibold text-sm">
              {day.label}
            </div>
            {slots.length > 0 ? (
              <div className="divide-y">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="px-4 py-3 flex items-center justify-between"
                  >
                    <div className="text-sm">
                      {slot.start_time} - {slot.end_time}
                      {!slot.is_available && (
                        <span className="text-red-600 mr-2">(غير متاح)</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                لا توجد أوقات عمل في هذا اليوم
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
