"use client";

import { useTransition, useRef } from "react";
import { addAvailability, deleteAvailability } from "@/app/actions/settings";
import { Clock, Plus, Trash2, Loader2 } from "lucide-react";
import { Availability } from "@prisma/client";

// ✨ 1. Define the dictionary props
interface AvailabilityManagerProps {
  tutorId: string;
  availability: Availability[]; 
  dict: {
    dayLabel: string;
    startTimeLabel: string;
    endTimeLabel: string;
    addButton: string;
    noAvailability: string;
    days: Record<string, string>; // Maps "MONDAY" to the translated string
  };
}

export default function AvailabilityManager({ tutorId, availability, dict }: AvailabilityManagerProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleAdd = (formData: FormData) => {
    const day = formData.get("day") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    
    startTransition(async () => {
      await addAvailability(tutorId, day, startTime, endTime);
      formRef.current?.reset(); 
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteAvailability(id);
    });
  };

  const daysOfWeek = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

  return (
    <div className="space-y-6">
      <form ref={formRef} action={handleAdd} className="flex flex-wrap gap-3 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex-grow min-w-[120px]">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{dict.dayLabel}</label>
          <select name="day" required className="w-full p-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 outline-none">
            {daysOfWeek.map(d => (
              <option key={d} value={d}>
                {dict.days[d]} {/* Displays the translation, submits the English value */}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-grow min-w-[100px]">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{dict.startTimeLabel}</label>
          <input type="time" name="startTime" required className="w-full p-2.5 rounded-lg border border-slate-200 text-sm font-medium outline-none" />
        </div>

        <div className="flex-grow min-w-[100px]">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{dict.endTimeLabel}</label>
          <input type="time" name="endTime" required className="w-full p-2.5 rounded-lg border border-slate-200 text-sm font-medium outline-none" />
        </div>

        <button disabled={isPending} type="submit" className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-600 transition flex items-center gap-2 h-[42px]">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} {dict.addButton}
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {availability.length === 0 && (
          <p className="text-slate-500 italic text-sm py-4 col-span-2">{dict.noAvailability}</p>
        )}
        {availability.map((slot) => (
          <div key={slot.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">{dict.days[slot.day]}</p>
                <p className="text-sm font-bold text-slate-900">{slot.startTime} - {slot.endTime}</p>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(slot.id)}
              disabled={isPending}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}