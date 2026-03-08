"use client";

import { useState, useMemo } from 'react';

// Interfaces to match your Prisma schema and props
interface Booking {
  id: string;
  day: string;
  timeSlot: string;
  status: string;
}

interface Availability {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

// Helper to slice raw time blocks into individual lesson strings
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
  bookings = [], 
  duration = 60,
  onSelectSlot
}: { 
  availability: Availability[], 
  bookings: Booking[],
  duration?: number,
  onSelectSlot: (day: string, time: string) => void
}) {
  const [selectedDay, setSelectedDay] = useState<string>("MONDAY");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // 1. Get unique days that have any availability
  const availableDays = useMemo(() => Array.from(new Set(availability.map(s => s.day))), [availability]);
  
  // 2. Get the raw availability blocks for the currently selected day
  const rawBlocks = useMemo(() => availability.filter(slot => slot.day === selectedDay), [availability, selectedDay]);

  // 3. Generate and FILTER slots to hide booked ones
  const availableSlots = useMemo(() => {
    // First, create all possible slices
    const allPossibleSlots = rawBlocks.flatMap(block => 
      generateTimeSlots(block.startTime, block.endTime, duration)
    );

    // Then, filter out any slot that matches an existing PENDING or CONFIRMED booking
    return allPossibleSlots.filter(timeRange => {
      const isBooked = bookings.some(b => 
        b.day === selectedDay && 
        b.timeSlot === timeRange && 
        ["PENDING", "CONFIRMED"].includes(b.status)
      );
      return !isBooked; // Keep the slot only if it's NOT booked
    });
  }, [rawBlocks, duration, bookings, selectedDay]);

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
              onClick={() => { 
                setSelectedDay(day); 
                setSelectedSlot(null); 
              }}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                ${selectedDay === day 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : isAvailable 
                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' 
                    : 'bg-slate-50 text-slate-300 cursor-not-allowed'}`}
            >
              {day.charAt(0) + day.slice(1).toLowerCase()}
            </button>
          );
        })}
      </div>

      {/* Available Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {availableSlots.length > 0 ? (
          availableSlots.map((timeRange, index) => (
            <button
              key={`${selectedDay}-${index}`}
              onClick={() => {
                setSelectedSlot(timeRange);
                onSelectSlot(selectedDay, timeRange);
              }}
              className={`py-3 px-4 border rounded-xl font-semibold transition-all text-center
                ${selectedSlot === timeRange 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 active:scale-95'}`}
            >
              {timeRange}
            </button>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 italic font-medium">
              No free slots available for {selectedDay.toLowerCase()}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}