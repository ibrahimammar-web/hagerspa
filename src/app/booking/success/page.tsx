"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface SuccessBooking {
  customer_name: string;
  booking_date: string;
  start_time: string;
  specialist_name: string | null;
  total_amount: number;
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<SuccessBooking | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        setBooking(data);
      } catch {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId]);

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-[#8b7355]">
            لا توجد تفاصيل لهذا الحجز.
          </p>
          <Link href="/" className="btn-primary">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[#8b7355]">جاري تحميل تفاصيل الحجز...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
      <div className="max-w-md w-full card p-6 text-center">
        <h1 className="text-2xl font-bold mb-3 text-[#2d2424]">
          تم إرسال طلب الحجز بنجاح 🎉
        </h1>
        {booking && (
          <>
            <p className="text-[#8b7355] mb-4">
              شكراً لك {booking.customer_name}. سيتم التواصل معك لتأكيد
              الحجز عبر الواتساب أو الاتصال.
            </p>
            <div className="bg-[#fef7f8] rounded-lg p-4 text-right text-sm mb-4 space-y-1">
              <div>
                <span className="text-gray-500">التاريخ:</span>{" "}
                <span>
                  {new Date(booking.booking_date).toLocaleDateString("ar-SA")}
                </span>
              </div>
              <div>
                <span className="text-gray-500">الوقت:</span>{" "}
                <span>{booking.start_time.slice(0, 5)}</span>
              </div>
              <div>
                <span className="text-gray-500">الأخصائية:</span>{" "}
                <span>{booking.specialist_name || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500">الإجمالي:</span>{" "}
                <span className="font-semibold text-[#d4af37]">
                  {booking.total_amount} ر.س
                </span>
              </div>
            </div>
          </>
        )}
        <Link href="/" className="btn-primary w-full block">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
