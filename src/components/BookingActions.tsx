"use client";

import { useTransition } from "react";
import { updateBookingStatus } from "@/app/actions/booking";
import { Loader2 } from "lucide-react";

export default function BookingActions({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (status: "CONFIRMED" | "CANCELLED") => {
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, status);
      if (!result.success) {
        alert(result.error);
      }
    });
  };

  return (
    <div className="flex gap-2 mt-4">
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
  );
}