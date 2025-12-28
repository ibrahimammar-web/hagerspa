"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name_ar: string;
  price_sar: number;
}

export default function ManageSpecialistServices({
  specialistId,
  allServices,
  linkedServiceIds,
}: {
  specialistId: string;
  allServices: Service[];
  linkedServiceIds: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(linkedServiceIds)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleService(serviceId: string) {
    const newSet = new Set(selected);
    if (newSet.has(serviceId)) {
      newSet.delete(serviceId);
    } else {
      newSet.add(serviceId);
    }
    setSelected(newSet);
  }

  async function handleSave() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/specialists/${specialistId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_ids: Array.from(selected),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر الحفظ");
      } else {
        router.refresh();
        alert("تم حفظ الخدمات بنجاح");
      }
    } catch {
      setError("حدث خطأ أثناء الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        اختر الخدمات التي تقدمها هذه الأخصائية:
      </p>

      <div className="space-y-2">
        {allServices.map((service) => (
          <label
            key={service.id}
            className="flex items-center gap-3 border rounded p-3 cursor-pointer hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={selected.has(service.id)}
              onChange={() => toggleService(service.id)}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">{service.name_ar}</div>
              <div className="text-xs text-gray-600">
                {service.price_sar} ر.س
              </div>
            </div>
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSave}
        disabled={loading}
        className="px-4 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
      >
        {loading ? "جارٍ الحفظ..." : "حفظ التغييرات"}
      </button>
    </div>
  );
}
