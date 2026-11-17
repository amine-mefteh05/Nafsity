import { cookies } from "next/headers";
import { dict, LANGS, type Lang } from "./dict";
export function getLang(): Lang { const v = cookies().get("lang")?.value as Lang | undefined; return v && LANGS.includes(v) ? v : "fr"; }
export function getT() { const l = getLang(); return { lang: l, dir: l === "ar" ? "rtl" : "ltr", t: (k: string) => dict[l][k] ?? dict.fr[k] ?? k }; }
