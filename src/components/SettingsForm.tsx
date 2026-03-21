"use client";

import { useState, useTransition } from "react";
import { updateTutorSettings } from "@/app/actions/tutor";
import { Loader2, CheckCircle2, MapPin, Laptop, Home, UserCheck } from "lucide-react";
import { TeachingMode } from "@prisma/client";

export default function SettingsForm({ initialData }: { initialData: any }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "success" | "error", message: string } | null>(null);

  // Existing Data
  const [bio, setBio] = useState(initialData?.bio || "");
  const [pricePerHour, setPricePerHour] = useState(initialData?.pricePerHour || 50);
  const [defaultDuration, setDefaultDuration] = useState(initialData?.defaultDuration || 60);

  // ✨ NEW Location Data
  const [address, setAddress] = useState(initialData?.address || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [maxTravelDistance, setMaxTravelDistance] = useState(initialData?.maxTravelDistance || 10);

  // ✨ NEW Teaching Modes (Store as an array of selected enums)
  const [teachingModes, setTeachingModes] = useState<TeachingMode[]>(initialData?.teachingModes || []);

  const toggleMode = (mode: TeachingMode) => {
    setTeachingModes(prev => 
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    );
  };

  const handleSave = () => {
    setStatus(null);
    startTransition(async () => {
      const result = await updateTutorSettings({
        bio,
        pricePerHour: Number(pricePerHour),
        defaultDuration: Number(defaultDuration),
        address,
        city,
        maxTravelDistance: Number(maxTravelDistance),
        teachingModes
      });

      if (result.success) {
        setStatus({ type: "success", message: "Settings saved successfully! Location mapped." });
        setTimeout(() => setStatus(null), 4000);
      } else {
        setStatus({ type: "error", message: result.error || "Failed to save settings." });
      }
    });
  };

  return (
    <div className="space-y-8">
      
      {/* 1. BASIC INFO */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Profile & Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-bold text-slate-700 mb-1 block">Bio</label>
            <textarea
              value={bio} onChange={e => setBio(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none h-32 resize-none transition-colors"
              placeholder="Tell students about your teaching style..."
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700 mb-1 block">Hourly Rate ($)</label>
            <input
              type="number" value={pricePerHour} onChange={e => setPricePerHour(Number(e.target.value))}
              className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700 mb-1 block">Default Session (Minutes)</label>
            <input
              type="number" step="15" value={defaultDuration} onChange={e => setDefaultDuration(Number(e.target.value))}
              className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 2. TEACHING MODALITIES */}
      <div className="pt-6 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">How you teach</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <button 
            onClick={() => toggleMode("ONLINE")}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
              teachingModes.includes("ONLINE") ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-indigo-200"
            }`}
          >
            <Laptop className="w-6 h-6" />
            <span className="font-bold text-sm">Online (Zoom/Meet)</span>
          </button>

          <button 
            onClick={() => toggleMode("IN_PERSON_TUTOR")}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
              teachingModes.includes("IN_PERSON_TUTOR") ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-indigo-200"
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="font-bold text-sm text-center">At My Location</span>
          </button>

          <button 
            onClick={() => toggleMode("IN_PERSON_STUDENT")}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
              teachingModes.includes("IN_PERSON_STUDENT") ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-indigo-200"
            }`}
          >
            <UserCheck className="w-6 h-6" />
            <span className="font-bold text-sm text-center">At Student's Location</span>
          </button>

        </div>
      </div>

      {/* 3. LOCATION & GEOCODING */}
      <div className="pt-6 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Location Details
        </h3>
        <p className="text-sm text-slate-500 mb-4">We use your address to calculate driving distance for in-person lessons. Your exact address is never shown publicly.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-bold text-slate-700 mb-1 block">Street Address</label>
            <input
              type="text" placeholder="e.g. Herzl St 50"
              value={address} onChange={e => setAddress(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700 mb-1 block">City</label>
            <input
              type="text" placeholder="e.g. Rishon LeZion"
              value={city} onChange={e => setCity(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700 mb-1 block">Max Travel Distance (km)</label>
            <input
              type="number" value={maxTravelDistance} onChange={e => setMaxTravelDistance(Number(e.target.value))}
              disabled={!teachingModes.includes("IN_PERSON_STUDENT")} // Only active if they travel!
              className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-colors disabled:bg-slate-100 disabled:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* STATUS & SUBMIT */}
      {status && (
        <div className={`p-4 rounded-xl flex items-center gap-2 text-sm font-bold animate-in fade-in ${
          status.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
        }`}>
          <CheckCircle2 className="w-5 h-5" />
          {status.message}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isPending}
        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-slate-900/20"
      >
        {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Profile & Location"}
      </button>

    </div>
  );
}