import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  weight: ["300", "400", "500", "700"],
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "مركز هاجر سبا وأكثر - Hajar Spa & More",
  description: "احجزي موعدك الآن في أفضل مركز تجميل نسائي بالرياض",
  keywords: "سبا, مساج, عناية بشرة, مناكير, حمام مغربي, الرياض",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={tajawal.className}>
        {children}
      </body>
    </html>
  );
}
