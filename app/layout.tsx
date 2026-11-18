import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import Script from "next/script";
import { themeInitScript } from "../lib/theme";
import SplashScreen from "./components/SplashScreen";
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
    // suppressHydrationWarning: סקריפט העיצוב מוסיף מאפייני data לפני ש-React נטען
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* מחיל את ערכת העיצוב השמורה לפני ההצגה הראשונה, בלי הבהוב */}
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
