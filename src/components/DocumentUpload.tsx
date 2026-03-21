"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { submitVerificationDocument } from "@/app/actions/verification";
import { UploadCloud, FileType, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

export default function DocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setStatus({ type: "error", message: "File is too large. Maximum size is 5MB." });
      return;
    }

    setIsUploading(true);
    setStatus({ type: null, message: "" });

    try {
      // 1. Create a unique file name so things don't get overwritten
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `verifications/${fileName}`; // Saves it inside a folder in the bucket

      // 2. Upload straight to the secure Supabase Vault
      const { error: uploadError } = await supabase.storage
        .from('tutor-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Tell your Postgres database to give them the Blue Checkmark!
      const dbResult = await submitVerificationDocument(filePath);

      if (dbResult.success) {
        setStatus({ type: "success", message: "Document securely uploaded! You are now verified." });
      } else {
        throw new Error(dbResult.error);
      }
    } catch (error: any) {
      console.error("Upload failed:", error);
      setStatus({ type: "error", message: "Failed to upload document. Please try again." });
    } finally {
      setIsUploading(false);
    }
  };

  if (status.type === "success") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex items-center gap-4 animate-in fade-in">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-bold text-emerald-900 text-lg">Identity Verified</h3>
          <p className="text-emerald-700 text-sm mt-1">Your documents are securely stored in our vault. The verified badge is now active on your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <ShieldCheck className="w-6 h-6 text-indigo-600" />
        <h3 className="text-xl font-bold text-slate-900">Get Verified</h3>
      </div>
      <p className="text-slate-500 text-sm mb-6">
        Upload a valid government ID, university degree, or teaching certificate to earn your blue checkmark and build trust with students.
      </p>

      {/* THE DROPZONE */}
      <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all group overflow-hidden">
        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
          {isUploading ? (
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
          ) : (
            <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-indigo-600 transition-colors mb-3" />
          )}
          
          <p className="mb-2 text-sm text-slate-600 font-bold">
            {isUploading ? "Uploading to secure vault..." : "Click to upload or drag and drop"}
          </p>
          <p className="text-xs text-slate-400">PDF, JPG, or PNG (MAX. 5MB)</p>
        </div>
        
        <input 
          type="file" 
          className="hidden" 
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
      </label>

      {status.type === "error" && (
        <p className="mt-4 text-sm font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
          {status.message}
        </p>
      )}
    </div>
  );
}