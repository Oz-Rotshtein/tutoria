"use client";

import { useState, useMemo } from 'react';

interface Availability {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

// Helper to slice time blocks into individual lessons
function generateTimeSlots(start: string, end: string, durationMinutes: number) {
  const slots: string[] = [];
  let current = new Date(`2026-01-01T${start}:00`);
  const endTime = new Date(`2026-01-01T${end}:00`);

  while (current.getTime() + durationMinutes * 60000 <= endTime.getTime()) {
    const slotStart = current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    current = new Date(current.getTime() + durationMinutes * 60000);
    const slotEnd = current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    slots.push(`${slotStart} - ${slotEnd}`);
  }
  return slots;
}

export default function TutorCalendar({ 
  availability, 
  duration = 60,
  onSelectSlot
}: { 
  availability: Availability[], 
  duration?: number,
  onSelectSlot: (day: string, time: string) => void
}) {
  const [selectedDay, setSelectedDay] = useState<string>("MONDAY");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const availableDays = useMemo(() => Array.from(new Set(availability.map(s => s.day))), [availability]);
  const rawBlocks = useMemo(() => availability.filter(slot => slot.day === selectedDay), [availability, selectedDay]);

  // THIS IS THE KEY: We turn 1 block into many slots
  const bookableSlots = useMemo(() => 
    rawBlocks.flatMap(block => generateTimeSlots(block.startTime, block.endTime, duration)),
    [rawBlocks, duration]
  );

  const weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

  return (
    <div className="mt-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold mb-6 text-slate-800">Select a Time</h2>

      {/* Day Picker */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 border-b border-slate-50 no-scrollbar">
        {weekDays.map((day) => {
          const isAvailable = availableDays.includes(day);
          return (
            <button
              key={day}
              disabled={!isAvailable}
              onClick={() => { setSelectedDay(day); setSelectedSlot(null); }}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                ${selectedDay === day ? 'bg-indigo-600 text-white shadow-md' : isAvailable ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}`}
            >
              {day.charAt(0) + day.slice(1).toLowerCase()}
            </button>
          );
        })}
      </div>

      {/* Sliced Time Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {bookableSlots.length > 0 ? (
          bookableSlots.map((timeRange, index) => (
            <button
              key={`${selectedDay}-${index}`}
              onClick={() => {
                setSelectedSlot(timeRange);
                onSelectSlot(selectedDay, timeRange);
              }}
              className={`py-3 px-4 border rounded-xl font-semibold transition-all text-center
                ${selectedSlot === timeRange ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'}`}
            >
              {timeRange}
            </button>
          ))
        ) : (
          <p className="col-span-full text-center py-10 text-slate-400 italic">No availability found.</p>
        )}
      </div>
    </div>
  );
}