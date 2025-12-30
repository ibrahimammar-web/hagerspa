// src/app/admin/page.tsx
import React from "react";

export default async function AdminHomePage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
      <div className="bg-white shadow rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#2d2424]">
          لوحة التحكم (Admin)
        </h1>
        <p className="mt-2 text-sm text-[#8b7355]">
          تم تسجيل الدخول بنجاح، ويمكنك الآن بناء واجهة الإدارة هنا.
        </p>
      </div>
    </div>
  );
}
