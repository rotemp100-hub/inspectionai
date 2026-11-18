// ניהול ערכת העיצוב: מצב תצוגה (בהיר/כהה/מערכת) וערכת צבעים.
// הערכים נשמרים ב-localStorage ומוחלים כמאפייני data על תגית <html>.

export const MODES = [
  { id: "light", label: "בהיר", icon: "☀️" },
  { id: "dark", label: "כהה", icon: "🌙" },
  { id: "system", label: "לפי המערכת", icon: "💻" },
] as const;
export type ModePref = (typeof MODES)[number]["id"];

export const PALETTES = [
  {
    id: "amber",
    label: "כתום בנייה",
    description: "הקלאסי של RP – כתום על אפור כהה",
    swatch: ["#1e293b", "#d97706", "#fef3c7"],
  },
  {
    id: "blueprint",
    label: "שרטוט כחול",
    description: "כחול הנדסי, פינות חדות ורשת שרטוט",
    swatch: ["#0f2a4a", "#2563eb", "#dbeafe"],
  },
  {
    id: "site",
    label: "ירוק אתר",
    description: "ירוק רגוע, מתאים לעבודה ארוכה",
    swatch: ["#14332a", "#059669", "#d1fae5"],
  },
  {
    id: "concrete",
    label: "בטון ואדום",
    description: "אפור בטון עם אדום בטיחות, פינות רכות",
    swatch: ["#27272a", "#dc2626", "#fee2e2"],
  },
] as const;
export type PaletteId = (typeof PALETTES)[number]["id"];

export const MODE_KEY = "rp-theme-mode";
export const PALETTE_KEY = "rp-theme-palette";
export const DEFAULT_MODE: ModePref = "system";
export const DEFAULT_PALETTE: PaletteId = "amber";

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // מצב פרטי / אחסון חסום – העיצוב פשוט לא יישמר
  }
}

function resolveMode(pref: ModePref): "light" | "dark" {
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyMode(pref: ModePref) {
  write(MODE_KEY, pref);
  const root = document.documentElement;
  root.dataset.modePref = pref;
  root.dataset.mode = resolveMode(pref);
}

export function applyPalette(id: PaletteId) {
  write(PALETTE_KEY, id);
  document.documentElement.dataset.palette = id;
}

/** מעקב אחרי שינוי מצב המערכת כשהמשתמש בחר "לפי המערכת" */
export function watchSystemMode(): () => void {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    const pref = (document.documentElement.dataset.modePref as ModePref) ?? DEFAULT_MODE;
    if (pref === "system") document.documentElement.dataset.mode = resolveMode("system");
  };
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function currentTheme(): { mode: ModePref; palette: PaletteId } {
  const d = document.documentElement.dataset;
  return {
    mode: (d.modePref as ModePref) ?? DEFAULT_MODE,
    palette: (d.palette as PaletteId) ?? DEFAULT_PALETTE,
  };
}

// סקריפט שרץ ב-<head> לפני הציור הראשון, כדי שלא יהיה הבהוב של צבעים לא נכונים.
const modeIds = MODES.map((m) => m.id);
const paletteIds = PALETTES.map((p) => p.id);
export const themeInitScript = `(function(){try{
var m=null,p=null;try{m=localStorage.getItem(${JSON.stringify(MODE_KEY)});p=localStorage.getItem(${JSON.stringify(PALETTE_KEY)});}catch(e){}
if(${JSON.stringify(modeIds)}.indexOf(m)<0)m=${JSON.stringify(DEFAULT_MODE)};
if(${JSON.stringify(paletteIds)}.indexOf(p)<0)p=${JSON.stringify(DEFAULT_PALETTE)};
var r=document.documentElement;r.dataset.modePref=m;r.dataset.palette=p;
r.dataset.mode=m==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):m;
}catch(e){}})();`;
