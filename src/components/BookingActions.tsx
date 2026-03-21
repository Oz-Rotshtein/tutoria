"use client";

import { useState, useTransition } from "react";
import { updateBookingStatus } from "@/app/actions/booking";
import { Loader2, AlertCircle } from "lucide-react";

export default function BookingActions({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // ✨ New error state

  const handleUpdate = (status: "CONFIRMED" | "CANCELLED") => {
    setErrorMessage(null); // Clear old errors
    
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, status);
      if (!result.success) {
        // ✨ Catch the server's clear error message
        setErrorMessage(result.error || "Failed to update booking status.");
      }
    });
  };

  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <button 
          onClick={() => handleUpdate("CONFIRMED")}
          disabled={isPending}
          className="flex-1 text-sm font-bold py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
        </button>
        <button 
          onClick={() => handleUpdate("CANCELLED")}
          disabled={isPending}
          className="flex-1 text-sm font-bold py-2.5 border-2 border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Decline"}
        </button>
      </div>

      {/* ✨ Error Message Display */}
      {errorMessage && (
        <div className="mt-3 bg-red-50 text-red-600 p-3 rounded-xl flex items-start gap-2 text-sm font-medium animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
}