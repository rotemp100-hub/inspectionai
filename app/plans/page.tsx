"use client";

// מסך תוכניות ומסמכים – שלב 2
// הקבצים נשמרים ב-Supabase Storage, ופרטי התוכניות בטבלת plans.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PLANS_BUCKET, supabase } from "../../lib/supabase";

const DISCIPLINES = ["אדריכלות", "קונסטרוקציה", "מערכות", "לא מסווג"] as const;
type Discipline = (typeof DISCIPLINES)[number];

const MAX_BYTES = 50 * 1024 * 1024; // מגבלת התוכנית החינמית

type Plan = {
  id: string;
  name: string;
  discipline: Discipline;
  storage_path: string;
  size_bytes: number;
  created_at: string;
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
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [filter, setFilter] = useState<Discipline | "הכול">("הכול");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const blobCache = useRef<Map<string, string>>(new Map());

  // טעינת רשימת התוכניות מהשרת
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (error) setError(`שגיאה בטעינת התוכניות: ${error.message}`);
      else {
        setPlans(data as Plan[]);
        if (data.length > 0) setSelectedId(data[0].id);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // הורדת הקובץ הנבחר לצפייה
  useEffect(() => {
    const plan = plans.find((p) => p.id === selectedId);
    if (!plan) {
      setViewUrl(null);
      return;
    }
    const cached = blobCache.current.get(plan.id);
    if (cached) {
      setViewUrl(cached);
      return;
    }
    let cancelled = false;
    setViewLoading(true);
    supabase.storage
      .from(PLANS_BUCKET)
      .download(plan.storage_path)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setError(`לא הצלחתי לפתוח את ${plan.name}: ${error?.message ?? ""}`);
          setViewUrl(null);
        } else {
          const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
          blobCache.current.set(plan.id, url);
          setViewUrl(url);
        }
        setViewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId, plans]);

  async function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const problems: string[] = [];
    const ok = files.filter((f) => {
      const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) problems.push(`${f.name} אינו PDF`);
      else if (f.size > MAX_BYTES) problems.push(`${f.name} גדול מ-50MB`);
      return isPdf && f.size <= MAX_BYTES;
    });
    setError(problems.length ? `לא הועלו: ${problems.join(", ")}` : null);

    for (const f of ok) {
      setUploading(f.name);
      // שם קובץ באנגלית בלבד באחסון (Supabase לא מקבל עברית בשמות), השם המקורי נשמר בטבלה
      const path = `${crypto.randomUUID()}.pdf`;
      const up = await supabase.storage
        .from(PLANS_BUCKET)
        .upload(path, f, { contentType: "application/pdf" });
      if (up.error) {
        problems.push(`${f.name}: ${up.error.message}`);
        continue;
      }
      const { data, error } = await supabase
        .from("plans")
        .insert({
          name: f.name,
          discipline: guessDiscipline(f.name),
          storage_path: path,
          size_bytes: f.size,
        })
        .select()
        .single();
      if (error || !data) {
        await supabase.storage.from(PLANS_BUCKET).remove([path]);
        problems.push(`${f.name}: ${error?.message ?? "שגיאה בשמירה"}`);
        continue;
      }
      blobCache.current.set(data.id, URL.createObjectURL(f));
      setPlans((prev) => [...prev, data as Plan]);
      setSelectedId(data.id);
    }
    setUploading(null);
    if (problems.length) setError(`לא הועלו: ${problems.join(", ")}`);
  }

  async function removePlan(plan: Plan) {
    if (!window.confirm(`למחוק את "${plan.name}"? אי אפשר לשחזר.`)) return;
    const st = await supabase.storage.from(PLANS_BUCKET).remove([plan.storage_path]);
    if (st.error) {
      setError(`שגיאה במחיקה: ${st.error.message}`);
      return;
    }
    const { error } = await supabase.from("plans").delete().eq("id", plan.id);
    if (error) {
      setError(`שגיאה במחיקה: ${error.message}`);
      return;
    }
    const cached = blobCache.current.get(plan.id);
    if (cached) URL.revokeObjectURL(cached);
    blobCache.current.delete(plan.id);
    const rest = plans.filter((p) => p.id !== plan.id);
    setPlans(rest);
    if (selectedId === plan.id) setSelectedId(rest[0]?.id ?? null);
  }

  async function setDiscipline(id: string, discipline: Discipline) {
    const before = plans;
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, discipline } : p)));
    const { error } = await supabase.from("plans").update({ discipline }).eq("id", id);
    if (error) {
      setPlans(before);
      setError(`שגיאה בעדכון התחום: ${error.message}`);
    }
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
              if (!uploading) addFiles(e.dataTransfer.files);
            }}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
              uploading ? "cursor-wait" : "cursor-pointer"
            } ${
              dragging
                ? "border-amber-500 bg-amber-50"
                : "border-slate-300 bg-white hover:border-amber-400"
            }`}
          >
            {uploading ? (
              <>
                <div className="text-4xl">⏳</div>
                <p className="mt-2 font-semibold">מעלה…</p>
                <p className="truncate text-sm text-slate-500" dir="auto">
                  {uploading}
                </p>
              </>
            ) : (
              <>
                <div className="text-4xl">📤</div>
                <p className="mt-2 font-semibold">גרור לכאן קבצי PDF</p>
                <p className="text-sm text-slate-500">או לחץ לבחירת קבצים · עד 50MB לקובץ</p>
              </>
            )}
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
            <div className="flex items-start justify-between gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)}>
                ✕
              </button>
            </div>
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
            {loading && (
              <li className="rounded-lg bg-white p-4 text-center text-sm text-slate-400 ring-1 ring-slate-200">
                טוען תוכניות…
              </li>
            )}
            {!loading && visible.length === 0 && (
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
                    <div className="text-xs text-slate-400">
                      {formatSize(p.size_bytes)} ·{" "}
                      {new Date(p.created_at).toLocaleDateString("he-IL")}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePlan(p);
                    }}
                    className="text-slate-400 hover:text-red-600"
                    title="מחיקה"
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
            ☁️ התוכניות נשמרות בענן (Supabase) ונשארות גם אחרי רענון.
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
              {viewLoading || !viewUrl ? (
                <div className="flex flex-1 items-center justify-center text-slate-400">
                  {viewLoading ? "פותח תוכנית…" : "לא ניתן להציג את הקובץ"}
                </div>
              ) : (
                <iframe
                  key={selected.id}
                  src={viewUrl}
                  title={selected.name}
                  className="w-full flex-1"
                />
              )}
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
