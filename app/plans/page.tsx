"use client";

// מסך תוכניות ומסמכים – שלב 1
// העלאת קבצי PDF, סיווג לפי תחום וצפייה בתוכנית.
// בשלב זה הקבצים נשמרים רק בדפדפן; שמירה קבועה תתווסף עם Supabase.

import Link from "next/link";
import { useRef, useState } from "react";

const DISCIPLINES = ["אדריכלות", "קונסטרוקציה", "מערכות", "לא מסווג"] as const;
type Discipline = (typeof DISCIPLINES)[number];

type PlanFile = {
  id: string;
  name: string;
  size: number;
  url: string;
  discipline: Discipline;
  uploadedAt: Date;
};

// ניחוש ראשוני של התחום לפי שם הקובץ. המשתמש תמיד יכול לשנות.
function guessDiscipline(fileName: string): Discipline {
  const n = fileName.toLowerCase();
  if (/(ארכ|אדריכ|arch|^a[-_ ]?\d)/.test(n)) return "אדריכלות";
  if (/(קונ|שלד|struct|^s[-_ ]?\d)/.test(n)) return "קונסטרוקציה";
  if (/(חשמל|אינסטל|מיזוג|ספרינק|מערכ|mep|elec|plumb|hvac|^[emp][-_ ]?\d)/.test(n))
    return "מערכות";
  return "לא מסווג";
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const disciplineColor: Record<Discipline, string> = {
  אדריכלות: "bg-sky-100 text-sky-800",
  קונסטרוקציה: "bg-orange-100 text-orange-800",
  מערכות: "bg-emerald-100 text-emerald-800",
  "לא מסווג": "bg-slate-100 text-slate-600",
};

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanFile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Discipline | "הכול">("הכול");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const pdfs = files.filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );
    const rejected = files.length - pdfs.length;
    setError(rejected > 0 ? `${rejected} קבצים נדחו – אפשר להעלות רק קבצי PDF.` : null);
    if (pdfs.length === 0) return;

    const newPlans: PlanFile[] = pdfs.map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      url: URL.createObjectURL(f),
      discipline: guessDiscipline(f.name),
      uploadedAt: new Date(),
    }));
    setPlans((prev) => [...prev, ...newPlans]);
    setSelectedId((prev) => prev ?? newPlans[0].id);
  }

  function removePlan(id: string) {
    setPlans((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      const rest = prev.filter((p) => p.id !== id);
      if (selectedId === id) setSelectedId(rest[0]?.id ?? null);
      return rest;
    });
  }

  function setDiscipline(id: string, discipline: Discipline) {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, discipline } : p)));
  }

  const visible = filter === "הכול" ? plans : plans.filter((p) => p.discipline === filter);
  const selected = plans.find((p) => p.id === selectedId) ?? null;
  const countOf = (d: Discipline) => plans.filter((p) => p.discipline === d).length;

  return (
    <div className="flex flex-1 flex-col">
      {/* כותרת */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-lg font-bold text-white"
            >
              RP
            </Link>
            <div>
              <h1 className="text-lg font-bold leading-tight">תוכניות ומסמכים</h1>
              <div className="text-xs text-slate-500">
                {plans.length} קבצים · {countOf("אדריכלות")} אדריכלות ·{" "}
                {countOf("קונסטרוקציה")} קונסטרוקציה · {countOf("מערכות")} מערכות
              </div>
            </div>
          </div>
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
            → חזרה למסך הראשי
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-6 py-6 lg:grid-cols-[380px_1fr]">
        {/* עמודה ימנית: העלאה ורשימה */}
        <aside className="flex flex-col gap-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
              dragging
                ? "border-amber-500 bg-amber-50"
                : "border-slate-300 bg-white hover:border-amber-400"
            }`}
          >
            <div className="text-4xl">📤</div>
            <p className="mt-2 font-semibold">גרור לכאן קבצי PDF</p>
            <p className="text-sm text-slate-500">או לחץ לבחירת קבצים מהמחשב</p>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
          )}

          {/* סינון לפי תחום */}
          <div className="flex flex-wrap gap-2">
            {(["הכול", ...DISCIPLINES] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setFilter(d)}
                className={`rounded-full px-3 py-1 text-sm ${
                  filter === d
                    ? "bg-slate-800 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* רשימת קבצים */}
          <ul className="flex flex-col gap-2">
            {visible.length === 0 && (
              <li className="rounded-lg bg-white p-4 text-center text-sm text-slate-400 ring-1 ring-slate-200">
                {plans.length === 0 ? "עדיין לא הועלו תוכניות" : "אין קבצים בתחום הזה"}
              </li>
            )}
            {visible.map((p) => (
              <li
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`cursor-pointer rounded-lg bg-white p-3 ring-1 transition ${
                  p.id === selectedId ? "ring-2 ring-amber-500" : "ring-slate-200 hover:ring-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium" dir="auto" title={p.name}>
                      📄 {p.name}
                    </div>
                    <div className="text-xs text-slate-400">{formatSize(p.size)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePlan(p.id);
                    }}
                    className="text-slate-400 hover:text-red-600"
                    title="הסרה"
                  >
                    ✕
                  </button>
                </div>
                <select
                  value={p.discipline}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setDiscipline(p.id, e.target.value as Discipline)}
                  className={`mt-2 rounded-md px-2 py-1 text-xs font-medium ${disciplineColor[p.discipline]}`}
                >
                  {DISCIPLINES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>

          <p className="text-xs leading-5 text-slate-400">
            בשלב זה הקבצים נשמרים רק בדפדפן ונעלמים ברענון הדף. שמירה קבועה תתווסף כשנחבר את
            Supabase.
          </p>
        </aside>

        {/* עמודה שמאלית: צפייה בתוכנית */}
        <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
          {selected ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
                <span className="truncate font-medium" dir="auto">
                  {selected.name}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs ${disciplineColor[selected.discipline]}`}
                >
                  {selected.discipline}
                </span>
              </div>
              <iframe
                key={selected.id}
                src={selected.url}
                title={selected.name}
                className="w-full flex-1"
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-slate-400">
              <div className="text-5xl">📐</div>
              <p className="mt-3">בחר או העלה תוכנית כדי לצפות בה</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
