"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewServicePage() {
  const router = useRouter();

  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [durationMin, setDurationMin] = useState<number | "">("");
  const [priceSar, setPriceSar] = useState<number | "">("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number | "">("");
  const [active, setActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_ar: nameAr,
          name_en: nameEn,
          description_ar: descriptionAr,
          duration_min: Number(durationMin),
          price_sar: Number(priceSar),
          image_url: imageUrl || null,
          category,
          active,
          display_order:
            displayOrder === "" ? null : Number(displayOrder),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر حفظ الخدمة");
      } else {
        router.push("/admin/services");
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
      <h1 className="text-xl font-semibold mb-4">إضافة خدمة جديدة</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm">اسم الخدمة (عربي)</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">اسم الخدمة (إنجليزي)</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">الوصف (عربي)</label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm"
            rows={3}
            value={descriptionAr}
            onChange={(e) => setDescriptionAr(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">المدة (بالدقائق)</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2 text-sm"
            value={durationMin}
            onChange={(e) =>
              setDurationMin(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">السعر (ر.س)</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2 text-sm"
            value={priceSar}
            onChange={(e) =>
              setPriceSar(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">رابط الصورة</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">الفئة</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
