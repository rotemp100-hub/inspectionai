// חיבור ל-Supabase מהדפדפן.
// הכתובת והמפתח הציבורי נקראים מהקובץ .env.local (לא נשמר ב-Git).
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "חסרים פרטי Supabase. ודא שהקובץ .env.local קיים והפעל מחדש את npm run dev.",
  );
}

export const supabase = createClient(url, key);

// שם תיקיית האחסון (bucket) של התוכניות
export const PLANS_BUCKET = "plans";
