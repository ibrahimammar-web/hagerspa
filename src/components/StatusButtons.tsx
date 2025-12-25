"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface StatusButtonsProps {
  bookingId: string;
  currentStatus: string;
}

export function StatusButtons({ bookingId, currentStatus }: StatusButtonsProps) {
   console.log("StatusButtons bookingId:", bookingId);
    const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function updateStatus(newStatus: string) {
  if (!bookingId) {
    setError("معرّف الحجز غير معروف");
    return;
  }
  console.log("UPDATE_STATUS_URL", `/api/bookings/${bookingId}/status`);

  setError(null);
  setLoading(newStatus);
  try {
    const res = await fetch(`/api/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "تعذر تحديث الحالة");
    } else {
      router.refresh();
    }
  } catch {
    setError("حدث خطأ أثناء الاتصال بالخادم");
  } finally {
    setLoading(null);
  }
}


  return (
    <div className="space-y-2 mt-3">
      {error && (
        <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateStatus("confirmed")}
          disabled={loading !== null}
          className="btn-secondary text-sm"
        >
          {loading === "confirmed" ? "جاري التأكيد..." : "تأكيد الحجز"}
        </button>
        <button
          type="button"
          onClick={() => updateStatus("cancelled")}
          disabled={loading !== null}
          className="btn-primary text-sm bg-red-500 hover:bg-red-600"
        >
          {loading === "cancelled" ? "جاري الإلغاء..." : "إلغاء الحجز"}
        </button>
        <button
          type="button"
          onClick={() => updateStatus("completed")}
          disabled={loading !== null}
          className="btn-primary text-sm bg-green-600 hover:bg-green-700"
        >
          {loading === "completed" ? "جاري التحديث..." : "تحديد كمكتمل"}
        </button>
      </div>
    </div>
  );
}
