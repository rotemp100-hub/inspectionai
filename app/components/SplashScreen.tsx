"use client";

// מסך פתיחה: מוצג מיד מה-HTML של השרת, ונעלם אחרי 2 שניות לפחות
// (ורק לאחר שהדף סיים להיטען).

import { useEffect, useState } from "react";

const MIN_MS = 2000;
const FADE_MS = 450;

export default function SplashScreen() {
  const [phase, setPhase] = useState<"shown" | "leaving" | "gone">("shown");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const leave = () => {
      // performance.now() נמדד מתחילת טעינת הדף
      const wait = Math.max(0, MIN_MS - performance.now());
      timer = setTimeout(() => {
        setPhase("leaving");
        timer = setTimeout(() => setPhase("gone"), FADE_MS);
      }, wait);
    };
    if (document.readyState === "complete") leave();
    else window.addEventListener("load", leave, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", leave);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      role="status"
      aria-label="טוען את RP Inspection AI"
      data-leaving={phase === "leaving"}
      className="splash hero-pattern fixed inset-0 z-50 flex flex-col items-center justify-center bg-hero text-hero-fg"
    >
      <div className="splash-logo flex h-24 w-24 items-center justify-center rounded-2xl bg-accent text-4xl font-bold text-accent-fg shadow-2xl">
        RP
      </div>
      <div className="splash-text mt-6 text-center">
        <div className="text-2xl font-bold" dir="ltr">
          RP Inspection AI
        </div>
        <div className="mt-1 text-sm text-hero-muted">מערכת פיקוח ובקרת בנייה</div>
      </div>
      <div className="splash-text mt-8 h-1 w-48 overflow-hidden rounded-full bg-white/15">
        <div className="splash-bar h-full w-full rounded-full bg-accent" />
      </div>
    </div>
  );
}
