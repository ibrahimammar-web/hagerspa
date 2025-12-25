"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name_ar: string;
  name_en: string | null;
  description_ar: string | null;
  duration_min: number;
  price_sar: number;
  image_url: string | null;
  category: string | null;
  active: boolean;
  display_order: number | null;
}

export default function EditServiceForm({ service }: { service: Service }) {
  const router = useRouter();

  const [nameAr, setNameAr] = useState(service.name_ar);
  const [nameEn, setNameEn] = useState(service.name_en ?? "");
  const [descriptionAr, setDescriptionAr] = useState(
    service.description_ar ?? ""
  );
  const [durationMin, setDurationMin] = useState<number | "">(
    service.duration_min
  );
  const [priceSar, setPriceSar] = useState<number | "">(
    Number(service.price_sar)
  );
  const [imageUrl, setImageUrl] = useState(service.image_url ?? "");
  const [category, setCategory] = useState(service.category ?? "");
  const [displayOrder, setDisplayOrder] = useState<number | "">(
    service.display_order ?? ""
  );
  const [active, setActive] = useState(service.active);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "PATCH",
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
        setError(data.error || "تعذر حفظ التعديلات");
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* نفس الحقول كما في صفحة الإنشاء، مع القيم المبدئية */}
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
        {loading ? "جارٍ الحفظ..." : "حفظ التعديلات"}
      </button>
    </form>
  );
}
