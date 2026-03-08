"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

export default function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    // 1. Grab the current URL parameters
    const params = new URLSearchParams(searchParams);
    
    // 2. Add or remove the 'q' (query) parameter based on input
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }

    // 3. Silently replace the URL in the browser without a full page reload
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="max-w-2xl mx-auto relative group">
      <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${isPending ? 'text-indigo-600 animate-pulse' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />
      
      <input 
        type="text" 
        // Set the default value to whatever is already in the URL when the page loads
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search by subject (e.g. Mathematics, JavaScript...)"
        className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-100 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all text-lg font-medium shadow-sm"
      />
    </div>
  );
}