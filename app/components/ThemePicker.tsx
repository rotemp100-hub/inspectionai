"use client";

// בורר עיצוב: מצב תצוגה (בהיר/כהה/מערכת) וערכת צבעים.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  DEFAULT_MODE,
  DEFAULT_PALETTE,
  MODES,
  PALETTES,
  applyMode,
  applyPalette,
  currentTheme,
  watchSystemMode,
} from "../../lib/theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-mode-pref", "data-palette"],
  });
  return () => observer.disconnect();
}
const getSnapshot = () => {
  const t = currentTheme();
  return `${t.mode}|${t.palette}`;
};
const getServerSnapshot = () => `${DEFAULT_MODE}|${DEFAULT_PALETTE}`;

export default function ThemePicker() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [mode, palette] = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).split(
    "|",
  );

  useEffect(() => watchSystemMode(), []);

  // סגירה בלחיצה בחוץ או ב-Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const modeIcon = MODES.find((m) => m.id === mode)?.icon ?? "🎨";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-muted transition hover:border-border-strong hover:text-fg"
      >
        <span aria-hidden>{modeIcon}</span>
        <span>עיצוב</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="הגדרות עיצוב"
          className="absolute end-0 top-full z-40 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface p-4 shadow-xl"
        >
          <h3 className="text-xs font-semibold text-subtle">מצב תצוגה</h3>
          <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-surface-2 p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => applyMode(m.id)}
                aria-pressed={mode === m.id}
                className={`flex flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-xs transition ${
                  mode === m.id
                    ? "bg-surface font-semibold text-fg shadow-sm"
                    : "text-muted hover:text-fg"
                }`}
              >
                <span aria-hidden className="text-base">
                  {m.icon}
                </span>
                {m.label}
              </button>
            ))}
          </div>

          <h3 className="mt-4 text-xs font-semibold text-subtle">ערכת עיצוב</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {PALETTES.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => applyPalette(p.id)}
                  aria-pressed={palette === p.id}
                  className={`flex w-full items-center gap-3 rounded-lg border p-2.5 text-start transition ${
                    palette === p.id
                      ? "border-accent ring-1 ring-accent"
                      : "border-border hover:border-border-strong"
                  }`}
                >
                  <span className="flex shrink-0 overflow-hidden rounded-md" aria-hidden>
                    {p.swatch.map((c) => (
                      <span key={c} className="h-8 w-4" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{p.label}</span>
                    <span className="block text-xs text-muted">{p.description}</span>
                  </span>
                  {palette === p.id && (
                    <span className="text-accent" aria-hidden>
                      ✓
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
