"use client";

import { useState, useTransition } from "react";
import { cancelBookingAsStudent } from "@/app/actions/booking";
import { Loader2, XCircle } from "lucide-react";

export default function StudentBookingActions({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCancel = () => {
    setError(null);
    startTransition(async () => {
      const result = await cancelBookingAsStudent(bookingId);
      if (!result.success) {
        setError(result.error || "Failed to cancel request.");
      }
    });
  };

  return (
    <div className="mt-4 border-t border-slate-100 pt-4 animate-in fade-in duration-300">
      <button
        onClick={handleCancel}
        disabled={isPending}
        className="w-full text-sm font-bold py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
        {isPending ? "Cancelling..." : "Cancel Request"}
      </button>
      
      {error && (
        <p className="text-red-500 text-xs font-bold mt-2 text-center bg-red-50 p-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}