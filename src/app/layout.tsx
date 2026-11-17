import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { getT } from "@/lib/i18n";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cairo = Cairo({ subsets: ["arabic"], variable: "--font-cairo" });
export const metadata: Metadata = { title: "Nafsity – Bien-être mental", description: "Plateforme de bien-être mental : psychologues, suivi d'humeur, journal, exercices et relaxation." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang, dir } = getT();
  return (
    <html lang={lang} dir={dir} className={`${inter.variable} ${cairo.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
