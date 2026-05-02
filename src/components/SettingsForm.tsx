"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, Video, Home, MapPin } from "lucide-react";

interface SettingsFormProps {
  initialData: any;
  dict: {
    nameLabel: string;
    bioLabel: string;
    priceLabel: string;
    taglineLabel: string; 
    durationLabel: string; 
    teachingStyleLabel: string; 
    saveButton: string;
    savingButton: string;
    successMessage: string;
    methodsLabel: string;
    methodOnline: string;
    methodAtTutor: string;
    methodAtStudent: string;
  };
}

export default function SettingsForm({ initialData, dict }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState("");
  
  // Existing State
  const [name, setName] = useState(initialData.name || "");
  const [bio, setBio] = useState(initialData.bio || "");
  const [price, setPrice] = useState(initialData.pricePerHour || 0);

  // NEW State Fields
  const [tagline, setTagline] = useState(initialData.tagline || "");
  const [defaultDuration, setDefaultDuration] = useState(initialData.defaultDuration || 60);
  const [teachingStyle, setTeachingStyle] = useState(initialData.teachingStyle || "");
  
  // Teaching Methods State (Array of strings)
  const [teachingMethods, setTeachingMethods] = useState<string[]>(initialData.teachingMethods || []);

  // Toggle Function for Cards
  const toggleMethod = (method: string) => {
    setTeachingMethods(prev => 
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };

  const handleSave = () => {
    startTransition(async () => {
      const payload = {
        name,
        bio,
        pricePerHour: price,
        tagline,
        defaultDuration,
        teachingStyle,
        teachingMethods // Included in the payload!
      };

      // await updateTutorProfile(payload); // Ensure this is active in your real app
      
      setStatus(dict.successMessage);
      setTimeout(() => setStatus(""), 3000);
    });
  };

  return (
    <div className="space-y-6">
      {status && (
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl flex items-center gap-2 text-sm font-bold mb-4">
          <CheckCircle2 className="w-4 h-4" /> {status}
        </div>
      )}

      {/* Row 1: Name & Headline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">{dict.nameLabel}</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-colors" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">{dict.taglineLabel}</label>
          <input 
            type="text" 
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Expert Math Tutor & Software Engineer"
            className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-colors" 
          />
        </div>
      </div>

      {/* Row 2: Price & Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">{dict.priceLabel}</label>
          <div className="relative">
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full p-3 ps-8 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-colors" 
            />
            <span className="absolute left-3 top-3.5 text-slate-400 font-bold">$</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">{dict.durationLabel}</label>
          <select 
            value={defaultDuration}
            onChange={(e) => setDefaultDuration(Number(e.target.value))}
            className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-colors"
          >
            <option value={30}>30 Minutes</option>
            <option value={45}>45 Minutes</option>
            <option value={60}>60 Minutes (1 Hour)</option>
            <option value={90}>90 Minutes (1.5 Hours)</option>
            <option value={120}>120 Minutes (2 Hours)</option>
          </select>
        </div>
      </div>

      {/* ✨ ROW 3: PREMIUM INTERACTIVE ICON CARDS */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">{dict.methodsLabel}</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: Online */}
          <div 
            onClick={() => toggleMethod("ONLINE")}
            className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-center gap-3 group ${
              teachingMethods.includes("ONLINE") 
                ? "border-indigo-600 bg-indigo-50/40 shadow-sm" 
                : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
            }`}
          >
            {teachingMethods.includes("ONLINE") && (
              <CheckCircle2 className="absolute top-3 end-3 w-5 h-5 text-indigo-600 animate-in zoom-in" />
            )}
            <div className={`p-3 rounded-xl transition-colors ${teachingMethods.includes("ONLINE") ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500 group-hover:text-indigo-500"}`}>
              <Video className="w-6 h-6" />
            </div>
            <span className={`font-bold text-sm ${teachingMethods.includes("ONLINE") ? "text-indigo-900" : "text-slate-600"}`}>
              {dict.methodOnline}
            </span>
          </div>

          {/* Card 2: At Tutor */}
          <div 
            onClick={() => toggleMethod("AT_TUTOR")}
            className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-center gap-3 group ${
              teachingMethods.includes("AT_TUTOR") 
                ? "border-indigo-600 bg-indigo-50/40 shadow-sm" 
                : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
            }`}
          >
            {teachingMethods.includes("AT_TUTOR") && (
              <CheckCircle2 className="absolute top-3 end-3 w-5 h-5 text-indigo-600 animate-in zoom-in" />
            )}
            <div className={`p-3 rounded-xl transition-colors ${teachingMethods.includes("AT_TUTOR") ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500 group-hover:text-indigo-500"}`}>
              <Home className="w-6 h-6" />
            </div>
            <span className={`font-bold text-sm ${teachingMethods.includes("AT_TUTOR") ? "text-indigo-900" : "text-slate-600"}`}>
              {dict.methodAtTutor}
            </span>
          </div>

          {/* Card 3: At Student */}
          <div 
            onClick={() => toggleMethod("AT_STUDENT")}
            className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-center gap-3 group ${
              teachingMethods.includes("AT_STUDENT") 
                ? "border-indigo-600 bg-indigo-50/40 shadow-sm" 
                : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
            }`}
          >
            {teachingMethods.includes("AT_STUDENT") && (
              <CheckCircle2 className="absolute top-3 end-3 w-5 h-5 text-indigo-600 animate-in zoom-in" />
            )}
            <div className={`p-3 rounded-xl transition-colors ${teachingMethods.includes("AT_STUDENT") ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500 group-hover:text-indigo-500"}`}>
              <MapPin className="w-6 h-6" />
            </div>
            <span className={`font-bold text-sm ${teachingMethods.includes("AT_STUDENT") ? "text-indigo-900" : "text-slate-600"}`}>
              {dict.methodAtStudent}
            </span>
          </div>

        </div>
      </div>

      {/* Row 4: Bio */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">{dict.bioLabel}</label>
        <textarea 
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none min-h-[120px] resize-none transition-colors" 
        />
      </div>

      {/* Row 5: Teaching Style */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">{dict.teachingStyleLabel}</label>
        <textarea 
          value={teachingStyle}
          onChange={(e) => setTeachingStyle(e.target.value)}
          placeholder="Describe your teaching methods, what a typical lesson looks like, and what students can expect..."
          className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none min-h-[120px] resize-none transition-colors" 
        />
      </div>

      <button 
        onClick={handleSave}
        disabled={isPending}
        className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-indigo-600/20"
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {isPending ? dict.savingButton : dict.saveButton}
      </button>
    </div>
  );
}