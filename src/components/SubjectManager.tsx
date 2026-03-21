"use client";

import { useState, useTransition, useEffect } from "react";
import { createAndConnectSubject, toggleSubject } from "@/app/actions/tutor";
import { Plus, X, Loader2, BookOpen, CheckCircle2 } from "lucide-react"; // ✨ Added CheckCircle2 icon

interface Subject {
  id: string;
  name: string;
}

interface Props {
  currentSubjects: Subject[];
}

export default function SubjectManager({ currentSubjects }: Props) {
  const [newSubject, setNewSubject] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null); // ✨ NEW: Success state
  const [isPending, startTransition] = useTransition();

  // ✨ NEW: Auto-hide the success message after 3 seconds
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
        setSuccessMsg("Subject added successfully!"); // ✨ Trigger success message
      } else {
        setError(result.error || "Failed to add subject.");
      }
    });
  };

  const handleRemoveSubject = (subjectId: string) => {
    setError(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const result = await toggleSubject(subjectId, false);
      if (result.success) {
        setSuccessMsg("Subject removed successfully!"); // ✨ Trigger success message
      } else {
        setError(result.error || "Failed to remove subject.");
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900">
        <BookOpen className="w-5 h-5 text-indigo-600" />
        Subjects I Teach
      </h2>

      {/* THE INPUT BAR */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="e.g., Advanced Calculus, React.js..."
          className="flex-1 p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-0 text-slate-700 font-medium transition-colors"
          onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
        />
        <button
          onClick={handleAddSubject}
          disabled={isPending || !newSubject.trim()}
          className="bg-indigo-600 text-white font-bold px-6 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Add</>}
        </button>
      </div>

      {/* ✨ ERROR MESSAGE */}
      {error && (
        <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl mb-4">{error}</p>
      )}

      {/* ✨ SUCCESS MESSAGE */}
      {successMsg && (
        <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-50 p-3 rounded-xl mb-4 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5" />
          <p>{successMsg}</p>
        </div>
      )}

      {/* THE CURRENT SUBJECTS TAGS */}
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
          <p className="text-slate-500 italic text-sm py-2">No subjects added yet. Add some above so students can find you!</p>
        )}
      </div>
    </div>
  );
}