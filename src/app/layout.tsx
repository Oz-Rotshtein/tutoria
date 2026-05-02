import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/lib/dictionary"; 

// ✨ Exact match to your file name
import Navbar from "@/components/Navbar"; 

const assistant = Assistant({ 
  subsets: ["latin", "hebrew"],
  variable: "--font-assistant",
});

export const metadata: Metadata = {
  title: "Tutorly",
  description: "Find your perfect tutor.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const locale = await getLocale();
  const direction = locale === "he" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={direction}>
      <body className={`${assistant.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        
        {/* ✨ The Navbar is injected here */}
        <Navbar locale={locale} />
        
        <main className="flex-grow">
          {children}
        </main>

      </body>
    </html>
  );
}