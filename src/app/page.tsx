
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Service } from "@/types/database.types";
import Link from "next/link";
import { Phone, MapPin, Clock } from "lucide-react";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#e8b4b8] to-[#faf8f5] py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-[#2d2424] mb-6">
            مركز هاجر سبا وأكثر
          </h1>
          <p className="text-xl md:text-2xl text-[#8b7355] mb-8">
            وقتك للاسترخاء والتجديد بدأ الآن 🌸
          </p>
          <Link href="/booking" className="btn-primary inline-block text-lg">
            احجزي موعدك الآن
          </Link>
        </div>
      </section>

      {/* Contact Info */}
      <section className="bg-white py-6 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <Phone className="text-[#e8b4b8]" size={24} />
            <a href="tel:0558810999" className="text-lg hover:text-[#e8b4b8]">
              0558810999
            </a>
          </div>
          <div className="flex items-center justify-center gap-3">
            <MapPin className="text-[#e8b4b8]" size={24} />
            <span className="text-lg">حي المنصورة، مخرج 20</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Clock className="text-[#e8b4b8]" size={24} />
            <span className="text-lg">12 ظهرًا - 10 مساءً</span>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#2d2424]">
            خدماتنا المميزة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.map((service: Service) => (
              <div key={service.id} className="card p-6">
                <h3 className="text-xl font-bold mb-2 text-[#2d2424]">
                  {service.name_ar}
                </h3>
                <p className="text-[#8b7355] mb-4 line-clamp-2">
                  {service.description_ar}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-[#d4af37]">
                    {service.price_sar} ر.س
                  </span>
                  <span className="text-sm text-gray-500">
                    {service.duration_min} دقيقة
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/booking" className="btn-primary text-lg">
              اختاري خدماتك واحجزي الآن
            </Link>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-[#2d2424]">
            لماذا تختارين مركز هاجر؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-bold text-lg mb-2">أخصائيات محترفات</h3>
              <p className="text-[#8b7355]">فريق ذو خبرة عالية ومدرب</p>
            </div>
            <div>
              <div className="text-4xl mb-3">🌿</div>
              <h3 className="font-bold text-lg mb-2">منتجات طبيعية</h3>
              <p className="text-[#8b7355]">نستخدم أفضل المنتجات الآمنة</p>
            </div>
            <div>
              <div className="text-4xl mb-3">💆‍♀️</div>
              <h3 className="font-bold text-lg mb-2">أجواء مريحة</h3>
              <p className="text-[#8b7355]">بيئة هادئة وخصوصية تامة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2d2424] text-white py-8 px-4 text-center">
        <p className="mb-2">مركز هاجر سبا وأكثر - Hajar Spa & More</p>
        <p className="text-sm text-gray-400">
          جميع الحقوق محفوظة © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
