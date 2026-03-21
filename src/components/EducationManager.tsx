"use client";

import { useState, useTransition } from "react";
import { addEducation, deleteEducation } from "@/app/actions/tutor";
import { supabase } from "@/lib/supabase"; // ✨ IMPORT SUPABASE
import { 
  Plus, Trash2, Loader2, GraduationCap, 
  CheckCircle2, AlertCircle, UploadCloud, FileText 
} from "lucide-react";

interface Education {
  id: string;
  degree: string;
  institution: string;
  startYear: number;
  endYear: number | null;
  documentUrl?: string | null; // Added just in case you want to display verified status later
}

export default function EducationManager({ currentEducation }: { currentEducation: Education[] }) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false); // ✨ NEW: Track upload status
  
  // 1. Core State
  const [degree, setDegree] = useState("");
  const [institution, setInstitution] = useState("");
  const [startYear, setStartYear] = useState(new Date().getFullYear() - 4);
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  
  // 2. Toggle & Status Messages
  const [isCurrent, setIsCurrent] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error", message: string } | null>(null);

  // ✨ 3. NEW: File State
  const [file, setFile] = useState<File | null>(null);

  const handleAdd = () => {
    if (!degree || !institution) return;
    setStatus(null);
    setIsUploading(true);
    
    startTransition(async () => {
      try {
        let documentUrl = undefined;

        // ✨ 4. NEW: Secure Upload Logic FIRST
        if (file) {
          if (file.size > 5 * 1024 * 1024) throw new Error("File is too large (Max 5MB).");
          
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
          const filePath = `education/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('tutor-documents')
            .upload(filePath, file);

          if (uploadError) throw uploadError;
          documentUrl = filePath; 
        }

        // Send everything (including the new documentUrl) to your backend
        const payload = {
          degree,
          institution,
          startYear: Number(startYear),
          ...(isCurrent ? {} : { endYear: Number(endYear) }),
          documentUrl // Pass the secure path to Prisma!
        };

        const result = await addEducation(payload);
        
        if (result.success) {
          // Reset everything back to defaults on success
          setDegree("");
          setInstitution("");
          setStartYear(new Date().getFullYear() - 4);
          setEndYear(new Date().getFullYear());
          setIsCurrent(false);
          setFile(null); // Clear the file!
          
          setStatus({ type: "success", message: "Education added successfully!" });
          setTimeout(() => setStatus(null), 3000); 
        } else {
          setStatus({ type: "error", message: result.error || "Failed to add education." });
        }
      } catch (error: any) {
        console.error("Submission error:", error);
        setStatus({ type: "error", message: error.message || "Something went wrong." });
      } finally {
        setIsUploading(false);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteEducation(id);
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 mt-8">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900">
        <GraduationCap className="w-5 h-5 text-indigo-600" />
        Education & Verification
      </h2>

      {/* THE INPUT FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-100">
        <input
          type="text" placeholder="Degree (e.g. B.S. Computer Science)"
          value={degree} onChange={e => setDegree(e.target.value)}
          className="p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-colors"
        />
        <input
          type="text" placeholder="Institution (e.g. MIT)"
          value={institution} onChange={e => setInstitution(e.target.value)}
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

        {/* "I currently study here" Checkbox */}
        <div className="md:col-span-2 flex items-center gap-2 py-2">
          <input 
            type="checkbox" 
            id="current-edu" 
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600 cursor-pointer"
          />
          <label htmlFor="current-edu" className="text-sm font-bold text-slate-600 cursor-pointer select-none">
            I currently study here
          </label>
        </div>

        {/* ✨ NEW: THE SECURE DROPZONE */}
        <div className="md:col-span-2 pt-4 border-t border-slate-200 mt-2">
          <label className="block text-sm font-bold text-slate-700 mb-2">Upload Degree / Transcript (Optional)</label>
          
          {file ? (
            <div className="bg-white border-2 border-indigo-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-indigo-500" />
                <div>
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button type="button" onClick={() => setFile(null)} className="text-sm font-bold text-red-500 hover:text-red-700">
                Remove
              </button>
            </div>
          ) : (
            <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-white hover:bg-slate-50 hover:border-indigo-400 transition-all group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                <p className="text-sm text-slate-600 font-bold">Click to upload document</p>
                <p className="text-xs text-slate-400">PDF, JPG, or PNG (MAX 5MB)</p>
              </div>
              <input 
                type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={isUploading || isPending}
              />
            </label>
          )}
        </div>
        
        {/* Status Messages */}
        {status && (
          <div className={`md:col-span-2 p-3 rounded-xl flex items-center gap-2 text-sm font-bold animate-in fade-in ${
            status.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
          }`}>
            {status.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {status.message}
          </div>
        )}

        <button
          onClick={handleAdd} disabled={isPending || isUploading || !degree || !institution}
          className="bg-indigo-600 text-white font-bold p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-[52px] md:col-span-2 transition-all mt-4 shadow-md hover:shadow-indigo-600/20"
        >
          {isPending || isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" /> Save Education</>}
        </button>
      </div>

      {/* THE RENDERED LIST */}
      <div className="space-y-3">
        {currentEducation.length > 0 ? (
          currentEducation.map(edu => (
            <div key={edu.id} className="flex justify-between items-center p-4 border-2 border-slate-100 rounded-xl bg-white hover:border-slate-200 transition-colors">
              <div>
                <p className="font-bold text-slate-900">{edu.degree}</p>
                <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                  {edu.institution} <span className="text-slate-300">•</span> {edu.startYear} - {edu.endYear || "Present"}
                  {/* Visual indicator if a document is attached */}
                  {edu.documentUrl && <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border border-emerald-100">Verified</span>}
                </p>
              </div>
              <button onClick={() => handleDelete(edu.id)} disabled={isPending} className="text-slate-400 hover:text-red-500 p-2 bg-slate-50 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-sm font-medium text-slate-400 py-4 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">No education added yet.</p>
        )}
      </div>
    </div>
  );
}