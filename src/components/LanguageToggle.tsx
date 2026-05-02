"use client";

import { useTransition } from "react";
import { setLanguage } from "@/app/actions/language";
import { Globe, Loader2 } from "lucide-react";

export default function LanguageToggle({ currentLang }: { currentLang: string }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(() => {
      const newLang = currentLang === "en" ? "he" : "en";
      setLanguage(newLang);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4 text-indigo-600" />}
      {currentLang === "en" ? "עברית" : "English"}
    </button>
  );
}