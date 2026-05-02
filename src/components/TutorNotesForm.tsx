"use client";

import { useState } from "react";
import { saveTutorNotes } from "@/app/actions/booking";
import { Loader2, Save, CheckCircle2 } from "lucide-react";

// ✨ 1. Define the props to accept the dictionary
interface TutorNotesFormProps {
  bookingId: string;
  initialNotes?: string | null;
  dict: {
    label: string;
    placeholder: string;
    saveButton: string;
    savedButton: string;
  };
}

export default function TutorNotesForm({ bookingId, initialNotes, dict }: TutorNotesFormProps) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!notes.trim() || notes === initialNotes) return;
    
    setIsSaving(true);
    setSaved(false);
    
    try {
      const result = await saveTutorNotes(bookingId, notes);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000); 
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        {dict.label}
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={dict.placeholder}
        className="w-full p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none text-sm min-h-[80px] transition-all"
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSave}
          disabled={isSaving || notes === initialNotes}
          className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-all"
        >
          {isSaving ? (
             <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {dict.savedButton}</>
          ) : (
            <><Save className="w-4 h-4" /> {dict.saveButton}</>
          )}
        </button>
      </div>
    </div>
  );
}