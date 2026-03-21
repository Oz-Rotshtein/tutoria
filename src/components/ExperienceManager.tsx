"use client";

import { useState, useTransition } from "react";
import { addExperience, deleteExperience } from "@/app/actions/tutor";
import { Plus, Trash2, Loader2, Briefcase, CheckCircle2, AlertCircle } from "lucide-react";

interface Experience {
  id: string;
  title: string;
  company: string;
  startYear: number;
  endYear: number | null;
  description: string | null;
}

export default function ExperienceManager({ currentExperience }: { currentExperience: Experience[] }) {
  const [isPending, startTransition] = useTransition();
  
  // 1. Core State
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [startYear, setStartYear] = useState(new Date().getFullYear() - 2);
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const [description, setDescription] = useState("");

  // ✨ 2. NEW: "Current" Toggle & Status Messages
  const [isCurrent, setIsCurrent] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error", message: string } | null>(null);

  const handleAdd = () => {
    if (!title || !company) return;
    setStatus(null);
    
    startTransition(async () => {
      const payload = {
        title,
        company,
        description,
        startYear: Number(startYear),
        ...(isCurrent ? {} : { endYear: Number(endYear) })
      };

      const result = await addExperience(payload);
      
      if (result.success) {
        // ✨ 3. NEW: Reset everything back to defaults on success!
        setTitle("");
        setCompany("");
        setDescription("");
        setStartYear(new Date().getFullYear() - 2);
        setEndYear(new Date().getFullYear());
        setIsCurrent(false);
        
        setStatus({ type: "success", message: "Experience added successfully!" });
        setTimeout(() => setStatus(null), 3000); // Hide success message after 3 seconds
      } else {
        setStatus({ type: "error", message: result.error || "Failed to add experience." });
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteExperience(id);
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 mt-8">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900">
        <Briefcase className="w-5 h-5 text-indigo-600" />
        Experience
      </h2>

      {/* THE INPUT FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-100">
        <input
          type="text" placeholder="Job Title (e.g. Senior Software Engineer)"
          value={title} onChange={e => setTitle(e.target.value)}
          className="p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-colors"
        />
        <input
          type="text" placeholder="Company (e.g. Google)"
          value={company} onChange={e => setCompany(e.target.value)}
          className="p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-colors"
        />
        
        <div className="flex gap-4 md:col-span-2 items-start">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Start Year</label>
            <input
              type="number" 
              value={startYear} onChange={e => setStartYear(Number(e.target.value))}
              className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">End Year</label>
            <input
              type="number" 
              value={endYear} onChange={e => setEndYear(Number(e.target.value))}
              disabled={isCurrent}
              className={`w-full p-3 rounded-xl border-2 transition-colors outline-none ${
                isCurrent ? "bg-slate-200 border-slate-200 text-slate-400 cursor-not-allowed" : "border-slate-200 focus:border-indigo-600 bg-white"
              }`}
            />
          </div>
        </div>

        {/* ✨ NEW: "I currently work here" Checkbox */}
        <div className="md:col-span-2 flex items-center gap-2 py-1">
          <input 
            type="checkbox" 
            id="current-exp" 
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600 cursor-pointer"
          />
          <label htmlFor="current-exp" className="text-sm font-bold text-slate-600 cursor-pointer select-none">
            I currently work here
          </label>
        </div>

        <textarea
          placeholder="Brief description of your role..."
          value={description} onChange={e => setDescription(e.target.value)}
          className="p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none md:col-span-2 resize-none h-24 mt-2 transition-colors"
        />

        {/* ✨ NEW: Status Messages */}
        {status && (
          <div className={`md:col-span-2 p-3 rounded-xl flex items-center gap-2 text-sm font-bold animate-in fade-in ${
            status.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
          }`}>
            {status.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {status.message}
          </div>
        )}

        <button
          onClick={handleAdd} disabled={isPending || !title || !company}
          className="bg-indigo-600 text-white font-bold p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-[52px] md:col-span-2 transition-all mt-2"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" /> Add Experience</>}
        </button>
      </div>

      {/* THE RENDERED LIST */}
      <div className="space-y-3">
        {currentExperience.length > 0 ? (
          currentExperience.map(exp => (
            <div key={exp.id} className="flex justify-between items-start p-4 border-2 border-slate-100 rounded-xl bg-white hover:border-slate-200 transition-colors">
              <div>
                <p className="font-bold text-slate-900">{exp.title}</p>
                <p className="text-sm font-bold text-indigo-600 mb-1">{exp.company}</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-2">
                  {exp.startYear} - {exp.endYear || "Present"}
                </p>
                {exp.description && <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{exp.description}</p>}
              </div>
              <button onClick={() => handleDelete(exp.id)} disabled={isPending} className="text-slate-400 hover:text-red-500 p-2 bg-slate-50 rounded-lg hover:bg-red-50 transition-colors shrink-0">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-sm font-medium text-slate-400 py-4 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">No experience added yet.</p>
        )}
      </div>
    </div>
  );
}