import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

// גופן עברי נקי וקריא
const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "RP Inspection AI – מערכת פיקוח ובקרת בנייה",
  description: "מערכת פיקוח, בקרת בנייה וניהול פרויקטים",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
