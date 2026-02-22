"use client"; // This tells Next.js this part is interactive
import { useState } from 'react';

interface Availability {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

export default function TutorCalendar({ availability }: { availability: Availability[] }) {
  const [selectedDay, setSelectedDay] = useState<string>("MONDAY");

  // Get the unique days this tutor actually has availability for
  const availableDays = Array.from(new Set(availability.map(s => s.day)));

  // Filter the slots based on the clicked day
  const slotsForSelectedDay = availability.filter(slot => slot.day === selectedDay);

  return (
    <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Select a Session</h2>

      {/* Day Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b">
        {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((day) => {
          const isAvailable = availableDays.includes(day);
          return (
            <button
              key={day}
              disabled={!isAvailable}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                ${selectedDay === day 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : isAvailable 
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
            >
              {day.charAt(0) + day.slice(1).toLowerCase()}
            </button>
          );
        })}
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {slotsForSelectedDay.length > 0 ? (
          slotsForSelectedDay.map((slot) => (
            <button
              key={slot.id}
              className="py-3 px-4 border border-blue-100 rounded-lg text-blue-700 font-medium hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-center"
            >
              {slot.startTime} - {slot.endTime}
            </button>
          ))
        ) : (
          <p className="col-span-full text-center py-10 text-gray-400 italic">
            No availability for {selectedDay.toLowerCase()}.
          </p>
        )}
      </div>
    </div>
  );
}