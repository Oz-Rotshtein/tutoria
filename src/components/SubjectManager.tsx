"use client";

import { useState, useTransition, useEffect } from "react";
import { createAndConnectSubject, toggleSubject } from "@/app/actions/tutor";
import { Plus, X, Loader2, BookOpen, CheckCircle2 } from "lucide-react"; 

interface Subject {
  id: string;
  name: string;
}

// ✨ 1. Define the dictionary props
interface SubjectManagerProps {
  currentSubjects: Subject[];
  dict: {
    title: string;
    placeholder: string;
    addButton: string;
    addSuccess: string;
    addError: string;
    removeSuccess: string;
    removeError: string;
    noSubjects: string;
  };
}

export default function SubjectManager({ currentSubjects, dict }: SubjectManagerProps) {
  const [newSubject, setNewSubject] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null); 
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    setError(null);
    setSuccessMsg(null);
    
    startTransition(async () => {
      const result = await createAndConnectSubject(newSubject);
      if (result.success) {
        setNewSubject(""); 
        setSuccessMsg(dict.addSuccess); 
      } else {
        setError(result.error || dict.addError);
      }
    });
  };

  const handleRemoveSubject = (subjectId: string) => {
    setError(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const result = await toggleSubject(subjectId, false);
      if (result.success) {
        setSuccessMsg(dict.removeSuccess);
      } else {
        setError(result.error || dict.removeError);
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900">
        <BookOpen className="w-5 h-5 text-indigo-600" />
        {dict.title}
      </h2>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder={dict.placeholder}
          className="flex-1 p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-0 text-slate-700 font-medium transition-colors"
          onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
        />
        <button
          onClick={handleAddSubject}
          disabled={isPending || !newSubject.trim()}
          className="bg-indigo-600 text-white font-bold px-6 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> {dict.addButton}</>}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl mb-4">{error}</p>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-50 p-3 rounded-xl mb-4 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5" />
          <p>{successMsg}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2.5">
        {currentSubjects.length > 0 ? (
          currentSubjects.map((subject) => (
            <div 
              key={subject.id} 
              className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold border border-indigo-100 flex items-center gap-2 group transition-colors hover:bg-indigo-100"
            >
              {subject.name}
              <button 
                onClick={() => handleRemoveSubject(subject.id)}
                disabled={isPending}
                className="text-indigo-400 hover:text-red-500 hover:bg-white rounded-full p-0.5 transition-all disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-slate-500 italic text-sm py-2">{dict.noSubjects}</p>
        )}
      </div>
    </div>
  );
}