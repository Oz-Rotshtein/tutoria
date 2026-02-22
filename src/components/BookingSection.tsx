"use client";

import { useState } from 'react';
import TutorCalendar from "./TutorCalendar";

// 1. Define the interface to fix the "any" error
interface Subject {
  id: string;
  name: string;
}

interface Availability {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface Tutor {
  id: string;
  name: string;
  pricePerHour: number;
  defaultDuration: number;
  availability: Availability[];
  subjects: Subject[];
}

// 2. Use the Tutor interface instead of 'any'
export default function BookingSection({ tutor }: { tutor: Tutor }) {
  const [selectedInfo, setSelectedInfo] = useState<{ day: string, time: string } | null>(null);

  const handleBooking = () => {
    if (!selectedInfo) return;
    // We will connect this to a Server Action next!
    console.log(`Booking for ${tutor.name} on ${selectedInfo.day} at ${selectedInfo.time}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <TutorCalendar 
          availability={tutor.availability} 
          duration={tutor.defaultDuration} 
          onSelectSlot={(day, time) => setSelectedInfo({ day, time })}
        />
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-slate-900 sticky top-24">
          <div className="mb-6">
            <span className="text-3xl font-bold">${tutor.pricePerHour}</span>
            <span className="text-slate-500 text-sm ml-1">/ hour</span>
          </div>

          {selectedInfo ? (
            <div className="mb-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in fade-in zoom-in duration-300">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Selected Lesson</p>
              <p className="text-slate-900 font-bold text-lg">{selectedInfo.day}</p>
              <p className="text-indigo-600 font-semibold">{selectedInfo.time}</p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
              <p className="text-sm text-slate-400">Please select a time slot to continue</p>
            </div>
          )}

          <button 
            onClick={handleBooking}
            disabled={!selectedInfo}
            className={`w-full font-bold py-4 rounded-2xl transition-all shadow-md
              ${selectedInfo 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}