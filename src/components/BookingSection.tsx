"use client";

import { useState, useTransition } from "react";
import { createBooking } from "@/app/actions/booking";
import { Loader2, Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react";

interface Availability {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface Booking {
  day: string;
  timeSlot: string;
  status: string;
}

interface BookingSectionProps {
  tutorId: string;
  pricePerHour: number;
  duration: number;
  availability: Availability[];
  bookings?: Booking[]; 
}

function generateTimeSlots(startTime: string, endTime: string, durationMinutes: number) {
  const parseTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
  
  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const slots: string[] = [];

  for (let current = start; current + durationMinutes <= end; current += durationMinutes) {
    slots.push(`${formatTime(current)} - ${formatTime(current + durationMinutes)}`);
  }
  
  return slots;
}

export default function BookingSection({ 
  tutorId, 
  pricePerHour, 
  duration, 
  availability, 
  bookings = [] 
}: BookingSectionProps) {
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // ✨ New error state
  const [isPending, startTransition] = useTransition();

  const [optimisticBookings, setOptimisticBookings] = useState<Booking[]>([]);
  const allBookings = [...bookings, ...optimisticBookings];

  const availableDays = Array.from(new Set(availability.map(a => a.day)));

  const availableSlots = availability
    .filter(a => a.day.toUpperCase() === selectedDay.toUpperCase())
    .flatMap(a => generateTimeSlots(a.startTime, a.endTime, duration))
    .filter(slot => {
      const cleanSlot = slot.replace(/\s/g, ''); 
      const isBooked = allBookings.some(b => {
        const cleanDbSlot = b.timeSlot.replace(/\s/g, ''); 
        const isSameDay = b.day.toUpperCase() === selectedDay.toUpperCase();
        const isSameTime = cleanDbSlot === cleanSlot;
        const isNotCancelled = b.status !== "CANCELLED";
        return isSameDay && isSameTime && isNotCancelled;
      });
      return !isBooked; 
    });

  const handleBookLesson = () => {
    if (!selectedDay || !selectedTime) return;
    
    setErrorMessage(null); // Clear old errors

    startTransition(async () => {
      // ✨ SECURITY UPDATE: We removed the MOCK_ID! The server handles it now.
      const result = await createBooking(tutorId, selectedDay, selectedTime);
      
      if (result.success) {
        setOptimisticBookings(prev => [
          ...prev, 
          { day: selectedDay, timeSlot: selectedTime, status: "PENDING" }
        ]);
        setSelectedDay("");
        setSelectedTime("");
        // Optional: you could add a success state message here too!
        alert("Booking request sent successfully!"); 
      } else {
        // ✨ Catch the server's clear error message
        setErrorMessage(result.error || "Failed to book lesson. Please try again.");
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
        <div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Session Rate</p>
          <p className="text-3xl font-black text-slate-900">${pricePerHour}<span className="text-lg text-slate-400 font-medium">/hr</span></p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1: Select Day */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
            <CalendarIcon className="w-4 h-4 text-indigo-600" /> Select Day
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableDays.length > 0 ? (
              availableDays.map(day => (
                <button
                  key={day}
                  onClick={() => { setSelectedDay(day); setSelectedTime(""); setErrorMessage(null); }}
                  className={`p-3 rounded-xl text-sm font-bold transition-all border-2 
                    ${selectedDay === day ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-100 text-slate-600 hover:border-indigo-200"}`}
                >
                  {day}
                </button>
              ))
            ) : (
              <p className="col-span-2 text-sm text-slate-500 italic">No availability listed.</p>
            )}
          </div>
        </div>

        {/* Step 2: Select Time */}
        {selectedDay && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
              <Clock className="w-4 h-4 text-indigo-600" /> Select Time
            </label>
            <div className="grid grid-cols-2 gap-2"> 
              {availableSlots.length > 0 ? (
                availableSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedTime(slot); setErrorMessage(null); }}
                    className={`p-3 rounded-xl text-sm font-bold transition-all border-2 
                      ${selectedTime === slot ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-100 text-slate-600 hover:border-indigo-200"}`}
                  >
                    {slot}
                  </button>
                ))
              ) : (
                <p className="col-span-2 text-sm text-slate-500 italic font-medium p-4 bg-slate-50 rounded-xl text-center">
                  All slots booked for this day.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ✨ Step 3: Error Message Display */}
        {errorMessage && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-start gap-2 text-sm font-medium animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Step 4: Confirm */}
        <button
          onClick={handleBookLesson}
          disabled={!selectedDay || !selectedTime || isPending}
          className="w-full mt-4 bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}