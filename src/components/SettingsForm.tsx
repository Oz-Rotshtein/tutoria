"use client";

import { useTransition } from "react";
import { updateTutorSettings } from "@/app/actions/settings";
import { Save, Loader2 } from "lucide-react";
import { Tutor } from "@prisma/client";

interface SettingsFormProps {
  initialData: Pick<Tutor, "id" | "pricePerHour" | "defaultDuration" | "bio">;
}

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSave = (formData: FormData) => {
    startTransition(async () => {
      await updateTutorSettings(initialData.id, formData);
      alert("Settings saved successfully!");
    });
  };

  return (
    <form action={handleSave} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Price Input */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Price Per Hour ($)</label>
          <input 
            type="number" 
            name="pricePerHour" 
            defaultValue={initialData.pricePerHour} 
            required 
            min="5"
            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium"
          />
        </div>

        {/* Duration Input */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Default Lesson Duration (min)</label>
          <select 
            name="defaultDuration" 
            defaultValue={initialData.defaultDuration}
            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 outline-none font-medium"
          >
            <option value="30">30 Minutes</option>
            <option value="45">45 Minutes</option>
            <option value="60">60 Minutes</option>
            <option value="90">90 Minutes</option>
          </select>
        </div>
      </div>

      {/* Bio Input */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">About Me (Bio)</label>
        <textarea 
          name="bio" 
          defaultValue={initialData.bio || ""} 
          rows={4}
          className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 outline-none font-medium resize-none"
          placeholder="Tell students about your teaching style..."
        />
      </div>

      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-70"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isPending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}