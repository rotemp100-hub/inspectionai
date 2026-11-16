import Link from "next/link";

// מסך ראשי – RP Inspection AI
// שלב 1: מסך בית בעברית (RTL). המודולים מסומנים "בקרוב" עד שנבנה אותם.

type Module = {
  title: string;
  description: string;
  icon: string;
  status: "בקרוב" | "פעיל";
  href?: string;
};

const modules: Module[] = [
  {
    title: "תוכניות ומסמכים",
    description: "העלאת תוכניות PDF, צפייה בשרטוטים וסידור לפי תחום.",
    icon: "📐",
    status: "פעיל",
    href: "/plans",
  },
  {
    title: "חישובי כמויות",
    description: "כמויות שלד וגמר, עם מקור, נוסחה ורמת ביטחון לכל חישוב.",
    icon: "🧮",
    status: "בקרוב",
  },
  {
    title: "הצלבת תוכניות",
    description: "השוואה בין אדריכלות, קונסטרוקציה ומערכות ואיתור סתירות.",
    icon: "🔍",
    status: "בקרוב",
  },
  {
    title: "ליקויים ותמונות",
    description: "תיעוד ליקויים מהשטח עם תמונות, מיקום וסטטוס טיפול.",
    icon: "📷",
    status: "בקרוב",
  },
  {
    title: "ביקורות באתר",
    description: "רישום ביקורים, ממצאים ומעקב אחרי סגירת הערות.",
    icon: "📋",
    status: "בקרוב",
  },
  {
    title: "דוחות",
    description: "הפקת דוחות פיקוח מקצועיים מוכנים לשליחה.",
    icon: "📄",
    status: "בקרוב",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* כותרת עליונה */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-lg font-bold text-white">
              RP
            </div>
            <div>
              <div className="text-lg font-bold leading-tight" dir="ltr">
                RP Inspection AI
              </div>
              <div className="text-xs text-slate-500">מערכת פיקוח ובקרת בנייה</div>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            גרסת פיתוח
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {/* כרטיס הפרויקט */}
        <section className="rounded-2xl bg-slate-800 p-8 text-white shadow-sm">
          <p className="text-sm text-amber-300">הפרויקט הפעיל</p>
          <h1 className="mt-1 text-3xl font-bold">טרם הוגדר פרויקט</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            בשלב הראשון המערכת מנהלת פרויקט אחד. כאן יופיעו פרטי הפרויקט, מצב התוכניות
            והליקויים הפתוחים.
          </p>
          <button
            type="button"
            disabled
            className="mt-6 cursor-not-allowed rounded-lg bg-amber-500/60 px-5 py-2.5 font-medium text-white"
          >
            הגדרת פרויקט (בקרוב)
          </button>
        </section>

        {/* מודולים */}
        <h2 className="mt-10 mb-4 text-xl font-bold">מודולים</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const card = (
            <div
              className={`h-full rounded-xl border bg-white p-5 shadow-sm ${
                m.href
                  ? "border-amber-300 transition hover:border-amber-500 hover:shadow-md"
                  : "border-slate-200 opacity-80"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{m.icon}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs ${
                    m.status === "פעיל"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {m.status}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold">{m.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{m.description}</p>
            </div>
            );
            return m.href ? (
              <Link key={m.title} href={m.href}>
                {card}
              </Link>
            ) : (
              <div key={m.title}>{card}</div>
            );
          })}
        </div>

        {/* עקרון העבודה */}
        <section className="mt-10 rounded-xl border-r-4 border-amber-500 bg-amber-50 p-5">
          <h2 className="font-bold text-amber-900">עקרון העבודה</h2>
          <p className="mt-1 text-sm leading-6 text-amber-900/80">
            המערכת לא ממציאה כמויות ולא משנה נוסחאות הנדסיות לבד. כל חישוב מציג מקור, נוסחה
            ורמת ביטחון, ותיקונים שלך נשמרים כדי לשפר את התוצאות.
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        RP Inspection AI · BUILDAI
      </footer>
    </div>
  );
}
