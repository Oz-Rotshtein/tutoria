"use client";

import { useState, useTransition } from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";
// import { updateProfileImage } from "@/app/actions/tutor"; // Keep your backend action!

interface ProfileImageManagerProps {
  currentImageUrl?: string | null;
  dict: {
    title: string;
    description: string;
    uploadButton: string;
  };
}

export default function ProfileImageManager({ currentImageUrl, dict }: ProfileImageManagerProps) {
  const [isPending, startTransition] = useTransition();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    startTransition(async () => {
      // Your Supabase upload logic goes here...
    });
  };

  return (
    <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 flex flex-col-reverse md:flex-row items-center justify-between gap-6">
      
      {/* Left Side: Text and Button */}
      <div className="flex-1 space-y-4 text-center md:text-start">
        <h3 className="text-xl font-bold text-slate-900">{dict.title}</h3>
        <p className="text-sm font-medium text-slate-500 max-w-sm">
          {dict.description}
        </p>
        
        <label className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 font-bold px-6 py-2.5 rounded-xl cursor-pointer hover:bg-indigo-100 transition-colors">
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
          {dict.uploadButton}
          <input 
            type="file" 
            className="hidden" 
            accept="image/png, image/jpeg" 
            onChange={handleUpload}
            disabled={isPending}
          />
        </label>
      </div>

      {/* Right Side: The Image */}
      <div className="shrink-0 relative">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100">
          {currentImageUrl ? (
            <img src={currentImageUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ImageIcon className="w-12 h-12" />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}