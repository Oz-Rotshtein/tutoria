"use client";

import { useState, useTransition } from "react";
import { createClient } from "@supabase/supabase-js";
import { updateProfileImage } from "@/app/actions/tutor";
import { Upload, Loader2, UserCircle, Image as ImageIcon } from "lucide-react";
import Image from "next/link"; // If you use Next.js Image component, import it

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProfileImageManager({ currentImageUrl }: { currentImageUrl?: string | null }) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.includes('image')) {
      setError("Please upload a valid image file (JPG, PNG).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setError("File is too large. Please keep it under 2MB.");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // 1. Create a unique filename so users don't overwrite each other's files
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`; // Saves inside a 'profiles' folder in the bucket

      // 2. Upload to Supabase Storage bucket named 'avatars'
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 3. Get the public URL of the image we just uploaded
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update local UI immediately
      setPreviewUrl(publicUrl);

      // 4. Save the URL to your Postgres Database via Server Action
      startTransition(async () => {
        const result = await updateProfileImage(publicUrl);
        if (!result.success) {
          setError(result.error || "Failed to save image to profile.");
        }
      });

    } catch (err: any) {
      console.error("Upload error:", err);
      setError("An error occurred while uploading the image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col items-center sm:flex-row gap-6">
      
      {/* THE AVATAR DISPLAY */}
      <div className="relative group shrink-0">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center relative">
          {previewUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <UserCircle className="w-16 h-16 text-slate-300" />
          )}
          
          {/* Loading Overlay */}
          {(isUploading || isPending) && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          )}
        </div>
      </div>

      {/* THE UPLOAD CONTROLS */}
      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Profile Picture</h2>
        <p className="text-slate-500 text-sm mb-4 max-w-sm">
          A professional photo helps students build trust and book more lessons. (Max 2MB, JPG/PNG)
        </p>

        {error && (
          <p className="text-red-500 text-xs font-bold mb-3 bg-red-50 p-2 rounded-lg inline-block">
            {error}
          </p>
        )}

        <div className="relative inline-block">
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading || isPending}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
          />
          <button 
            disabled={isUploading || isPending}
            className="bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-100 hover:border-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 pointer-events-none"
          >
            <ImageIcon className="w-4 h-4" />
            {isUploading ? "Uploading..." : isPending ? "Saving..." : "Upload New Photo"}
          </button>
        </div>
      </div>

    </div>
  );
}