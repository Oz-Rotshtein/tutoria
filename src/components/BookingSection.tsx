"use client";

import { useState, useTransition } from "react";
import { createBooking } from "@/app/actions/booking";
import { Loader2, Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2, MapPin, Repeat } from "lucide-react";

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
  date?: string | Date | null; // ✨ NEW: Now expects a real date
}

interface BookingSectionProps {
  tutorId: string;
  pricePerHour: number;
  duration: number;
  availability: Availability[];
  bookings?: Booking[]; 
  teachingModes: string[]; // ✨ NEW: Needs to know what modes the tutor offers
}

// Your awesome math function stays exactly the same!
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
  bookings = [],
  teachingModes
}: BookingSectionProps) {
  // ✨ NEW STATE FOR CALENDAR & RECURRING
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<string>(teachingModes[0] || "ONLINE");
  const [isRecurring, setIsRecurring] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [optimisticBookings, setOptimisticBookings] = useState<Booking[]>([]);
  const allBookings = [...bookings, ...optimisticBookings];

  // Figure out the Day of the Week from the chosen Calendar Date
  const getDayOfWeek = (dateString: string) => {
    if (!dateString) return "";
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const dayOfWeek = getDayOfWeek(selectedDate);

  // Generate and filter the slots for the chosen exact date
  const availableSlots = availability
    .filter(a => a.day.toUpperCase() === dayOfWeek.toUpperCase())
    .flatMap(a => generateTimeSlots(a.startTime, a.endTime, duration))
    .filter(slot => {
      const cleanSlot = slot.replace(/\s/g, ''); 
      const isBooked = allBookings.some(b => {
        const cleanDbSlot = b.timeSlot.replace(/\s/g, ''); 
        // We now check if the exact DATE matches, not just the day of the week!
        const isSameDate = b.date ? new Date(b.date).toISOString().split('T')[0] === selectedDate : false;
        const isSameTime = cleanDbSlot === cleanSlot;
        const isNotCancelled = b.status !== "CANCELLED";
        return isSameDate && isSameTime && isNotCancelled;
      });
      return !isBooked; 
    });

  const handleBookLesson = () => {
    if (!selectedDate || !selectedTime) return;
    
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      // ✨ Send the new complex payload to the server action
      const result = await createBooking({
        tutorId,
        date: selectedDate,
        timeSlot: selectedTime,
        mode: selectedMode as any,
        isRecurring
      });
      
      if (result.success) {
        setOptimisticBookings(prev => [
          ...prev, 
          { day: dayOfWeek, date: selectedDate, timeSlot: selectedTime, status: "PENDING" }
        ]);
        setSuccessMessage(isRecurring ? "4 Weekly lessons requested!" : "Lesson requested successfully!");
        setSelectedDate("");
        setSelectedTime("");
        setIsRecurring(false);
      } else {
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
        {/* ✨ Step 1: Select EXACT DATE (Replaced the Day Buttons) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
            <CalendarIcon className="w-4 h-4 text-indigo-600" /> 1. Select a Date
          </label>
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]} // Prevent booking in the past
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedTime(""); // Reset time if date changes
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-all text-slate-700 font-medium bg-slate-50 hover:bg-white"
          />
        </div>

        {/* Step 2: Select Time */}
        {selectedDate && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
              <Clock className="w-4 h-4 text-indigo-600" /> 2. Select Time ({dayOfWeek})
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
                <p className="col-span-2 text-sm text-slate-500 italic font-medium p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-center">
                  Tutor is not available on {dayOfWeek.toLowerCase()}s, or all slots are booked.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ✨ Step 3: Select Mode & Recurring */}
        {selectedTime && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
                <MapPin className="w-4 h-4 text-indigo-600" /> 3. Lesson Location
              </label>
              <select 
                value={selectedMode} 
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none font-medium text-slate-700 appearance-none bg-slate-50 hover:bg-white cursor-pointer"
              >
                {teachingModes.map(mode => (
                  <option key={mode} value={mode}>{mode.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>

            {/* THE RECURRING CHECKBOX */}
            <div 
              className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors" 
              onClick={() => setIsRecurring(!isRecurring)}
            >
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${isRecurring ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-300"}`}>
                {isRecurring && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                  <Repeat className="w-4 h-4 text-indigo-600" /> Repeat Weekly
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Automatically request this slot for the next 4 weeks.</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {errorMessage && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-2 text-sm font-bold animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}
        {successMessage && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-start gap-2 text-sm font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Step 4: Confirm */}
        <button
          onClick={handleBookLesson}
          disabled={!selectedDate || !selectedTime || isPending}
          className="w-full mt-4 bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : "Request Booking"}
        </button>
      </div>
    </div>
  );
}