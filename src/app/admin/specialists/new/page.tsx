"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewSpecialistPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [bioAr, setBioAr] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number | "">("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/specialists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio_ar: bioAr,
          avatar_url: avatarUrl || null,
          phone,
          email,
          display_order:
            displayOrder === "" ? null : Number(displayOrder),
          active,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر حفظ الأخصائية");
      } else {
        router.push("/admin/specialists");
        router.refresh();
      }
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-semibold mb-4">إضافة أخصائية جديدة</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm">الاسم</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">الوصف (عربي)</label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm"
            rows={3}
            value={bioAr}
            onChange={(e) => setBioAr(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">رابط الصورة (Avatar URL)</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">رقم الجوال</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">البريد الإلكتروني</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">ترتيب العرض</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2 text-sm"
            value={displayOrder}
            onChange={(e) =>
              setDisplayOrder(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          مفعّلة
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
        >
          {loading ? "جارٍ الحفظ..." : "حفظ"}
        </button>
      </form>
    </div>
  );
}
