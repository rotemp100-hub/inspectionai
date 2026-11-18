import Link from "next/link";
import ThemePicker from "./components/ThemePicker";

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
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-lg font-bold text-accent-fg">
              RP
            </div>
            <div>
              <div className="text-lg font-bold leading-tight" dir="ltr">
                RP Inspection AI
              </div>
              <div className="text-xs text-muted">מערכת פיקוח ובקרת בנייה</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-surface-2 px-3 py-1 text-xs text-muted sm:inline">
              גרסת פיתוח
            </span>
            <ThemePicker />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        {/* כרטיס הפרויקט */}
        <section className="hero-pattern rounded-2xl bg-hero p-8 text-hero-fg shadow-sm">
          <p className="text-sm text-hero-accent">הפרויקט הפעיל</p>
          <h1 className="mt-1 text-3xl font-bold">טרם הוגדר פרויקט</h1>
          <p className="mt-3 max-w-2xl text-hero-muted">
            בשלב הראשון המערכת מנהלת פרויקט אחד. כאן יופיעו פרטי הפרויקט, מצב התוכניות
            והליקויים הפתוחים.
          </p>
          <button
            type="button"
            disabled
            className="mt-6 cursor-not-allowed rounded-lg bg-accent px-5 py-2.5 font-medium text-accent-fg opacity-60"
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
              className={`h-full rounded-xl border bg-surface p-5 shadow-sm ${
                m.href
                  ? "border-accent/50 transition hover:border-accent hover:shadow-md"
                  : "border-border opacity-80"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{m.icon}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs ${
                    m.status === "פעיל"
                      ? "bg-success-soft text-success-fg"
                      : "bg-surface-2 text-muted"
                  }`}
                >
                  {m.status}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold">{m.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted">{m.description}</p>
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
        <section className="mt-10 rounded-xl border-r-4 border-accent bg-accent-soft p-5">
          <h2 className="font-bold text-accent-soft-fg">עקרון העבודה</h2>
          <p className="mt-1 text-sm leading-6 text-accent-soft-fg/80">
            המערכת לא ממציאה כמויות ולא משנה נוסחאות הנדסיות לבד. כל חישוב מציג מקור, נוסחה
            ורמת ביטחון, ותיקונים שלך נשמרים כדי לשפר את התוצאות.
          </p>
        </section>
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-subtle">
        RP Inspection AI · BUILDAI
      </footer>
    </div>
  );
}
