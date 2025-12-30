"use client";

import { useState } from "react";

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export function CancelBookingButton({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState<string>(status);
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);

  const canCancel =
    localStatus === "pending_payment" || localStatus === "confirmed";

  if (!canCancel && !cancelled) return null;

  async function handleCancel() {
    if (!confirm("هل أنت متأكد من إلغاء هذا الحجز؟")) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر إلغاء الحجز");
      } else {
        setLocalStatus("cancelled");
        setCancelled(true);
      }
    } catch {
      setError("حدث خطأ أثناء الإلغاء");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2 flex flex-col items-start gap-1">
      {!cancelled && (
        <button
          onClick={handleCancel}
          disabled={loading}
          className="px-3 py-1 rounded-lg border border-red-300 text-red-600 text-xs hover:bg-red-50 disabled:opacity-60"
        >
          {loading ? "جارٍ الإلغاء..." : "إلغاء الحجز"}
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
      {cancelled && !error && (
        <span className="text-xs text-green-600">
          تم إلغاء الحجز بنجاح.
        </span>
      )}
    </div>
  );
}
