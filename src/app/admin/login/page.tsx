"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/admin/login/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "تعذر تسجيل الدخول");
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("حدث خطأ أثناء تسجيل الدخول");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white shadow rounded-2xl p-6 space-y-4">
        <h1 className="text-xl font-bold text-[#2d2424] text-center">
          تسجيل دخول الإدارة
        </h1>
        <form className="space-y-3" onSubmit={handleLogin}>
          <div>
            <label className="block mb-1 text-sm">البريد الإلكتروني</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 text-right"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">كلمة المرور</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 text-right"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-xs text-red-600 text-right">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-[#d4af37] text-[#2d2424] font-semibold disabled:opacity-60"
          >
            {loading ? "جار تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
