"use client";

import React, { useState } from 'react';
import { Clock, Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import { updateAvailability } from '@/app/actions/availability';

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;
type Day = typeof DAYS[number];

interface TimeSlot {
  startTime: string;
  endTime: string;
}

// Map of error messages per day
type ErrorsState = Record<Day, string | null>;

type ScheduleState = Record<Day, TimeSlot[]>;

interface AvailabilityData {
  day: Day;
  startTime: string;
  endTime: string;
}

interface Props {
  tutorId: string;
  initialData: AvailabilityData[];
}

export default function AvailabilitySettings({ tutorId, initialData }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  
  // Track errors for each day to show red text
  const [errors, setErrors] = useState<ErrorsState>(() => {
    const map: Partial<ErrorsState> = {};
    DAYS.forEach(day => map[day] = null);
    return map as ErrorsState;
  });

  const [schedule, setSchedule] = useState<ScheduleState>(() => {
    const map: Partial<ScheduleState> = {};
    DAYS.forEach(day => {
      const daySlots = initialData
        .filter(d => d.day === day)
        .map(d => ({ startTime: d.startTime, endTime: d.endTime }));
      map[day] = daySlots;
    });
    return map as ScheduleState;
  });

  const addSlot = (day: Day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: [...prev[day], { startTime: "09:00", endTime: "10:00" }]
    }));
    // Clear error when user modifies data
    setErrors(prev => ({ ...prev, [day]: null }));
  };

  const removeSlot = (day: Day, index: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
    setErrors(prev => ({ ...prev, [day]: null }));
  };

  const updateSlot = (day: Day, index: number, field: keyof TimeSlot, value: string) => {
    setSchedule(prev => {
      const newDaySlots = [...prev[day]];
      newDaySlots[index] = { ...newDaySlots[index], [field]: value };
      return { ...prev, [day]: newDaySlots };
    });
    setErrors(prev => ({ ...prev, [day]: null }));
  };

  // --- THE VALIDATION LOGIC ---
  const validateSchedule = (): boolean => {
    let isValid = true;
    const newErrors: Partial<ErrorsState> = {};

    DAYS.forEach(day => {
      const slots = schedule[day];
      if (slots.length === 0) return;

      // 1. Sort slots by start time to check sequence
      const sorted = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));

      for (let i = 0; i < sorted.length; i++) {
        const current = sorted[i];
        
        // Check A: Start Time >= End Time (Impossible)
        if (current.startTime >= current.endTime) {
          newErrors[day] = "End time must be after start time.";
          isValid = false;
          break;
        }

        // Check B: Overlaps with previous slot
        if (i > 0) {
          const previous = sorted[i - 1];
          if (current.startTime < previous.endTime) {
            newErrors[day] = "Time slots cannot overlap.";
            isValid = false;
            break;
          }
        }
      }
    });

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleSave = async () => {
    // 1. Run Validation First
    if (!validateSchedule()) {
      alert("Please fix the errors in your schedule before saving.");
      return;
    }

    setIsSaving(true);
    
    // Sort the slots before sending to DB so they look nice
    const payload = DAYS.flatMap(day => 
      [...schedule[day]]
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .map(slot => ({
          day: day,
          startTime: slot.startTime,
          endTime: slot.endTime
        }))
    );

    const result = await updateAvailability(tutorId, payload);

    if (result.success) {
      alert("Schedule Saved Successfully!");
    } else {
      alert("Error saving schedule.");
    }
    setIsSaving(false);
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mt-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Clock className="text-indigo-600" size={24} />
          <h2 className="text-2xl font-bold text-slate-800">Weekly Schedule</h2>
        </div>
      </div>

      <div className="space-y-6">
        {DAYS.map((day) => (
          <div key={day} className={`flex flex-col md:flex-row md:items-start gap-4 p-4 rounded-xl border transition-colors bg-slate-50/50 ${errors[day] ? 'border-red-300 bg-red-50' : 'border-slate-100'}`}>
            
            {/* Day Name */}
            <div className="w-32 pt-2">
              <span className={`font-bold tracking-wide text-sm ${errors[day] ? 'text-red-600' : 'text-slate-700'}`}>{day}</span>
              {errors[day] && (
                <div className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} /> {errors[day]}
                </div>
              )}
            </div>

            {/* Time Slots Area */}
            <div className="flex-1 space-y-3">
              {schedule[day].length === 0 && (
                <div className="text-sm text-slate-400 italic pt-2">Unavailable</div>
              )}

              {schedule[day].map((slot, index) => (
                <div key={index} className="flex items-center gap-2 animate-in slide-in-from-left-2 fade-in duration-200">
                  <input 
                    type="time" 
                    value={slot.startTime}
                    onChange={(e) => updateSlot(day, index, 'startTime', e.target.value)}
                    className="p-2 border border-slate-200 rounded-lg bg-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 shadow-sm"
                  />
                  <span className="text-slate-300 font-bold">-</span>
                  <input 
                    type="time" 
                    value={slot.endTime}
                    onChange={(e) => updateSlot(day, index, 'endTime', e.target.value)}
                    className="p-2 border border-slate-200 rounded-lg bg-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 shadow-sm"
                  />
                  
                  <button 
                    onClick={() => removeSlot(day, index)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove time slot"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Button */}
            <button 
              onClick={() => addSlot(day)}
              className="mt-1 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end pt-6 border-t border-slate-100">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : <><Save size={20} /> Save Schedule</>}
        </button>
      </div>
    </div>
  );
}