"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/app/actions/review";
import { Star, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ReviewFormProps {
  bookingId: string;
  tutorId: string;
  tutorName: string;
  onSuccess?: () => void; // Optional callback to close a modal if you use one
}

export default function ReviewForm({ bookingId, tutorId, tutorName, onSuccess }: ReviewFormProps) {
  const [isPending, startTransition] = useTransition();
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error", message: string } | null>(null);

  const handleSubmit = () => {
    if (rating === 0) {
      setStatus({ type: "error", message: "Please select a star rating." });
      return;
    }
    
    setStatus(null);
    
    startTransition(async () => {
      const result = await submitReview({
        bookingId,
        tutorId,
        rating,
        comment
      });

      if (result.success) {
        setStatus({ type: "success", message: "Review submitted! Thank you." });
        if (onSuccess) {
          setTimeout(() => onSuccess(), 2000); // Trigger success callback after 2 seconds
        }
      } else {
        setStatus({ type: "error", message: result.error || "Failed to submit." });
      }
    });
  };

  // If successfully submitted, hide the form and just show the thank you message
  if (status?.type === "success") {
    return (
      <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-emerald-100">
        <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-500" />
        <h3 className="text-lg font-bold">Review Published</h3>
        <p className="text-sm mt-1 text-emerald-600">Your feedback helps {tutorName} and future students!</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full">
      <h3 className="text-lg font-bold text-slate-900 mb-1">Rate your lesson</h3>
      <p className="text-sm text-slate-500 mb-6">How was your experience with {tutorName}?</p>

      {/* THE INTERACTIVE STARS */}
      <div className="flex items-center gap-2 mb-6" onMouseLeave={() => setHoveredRating(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star 
              className={`w-10 h-10 transition-colors ${
                star <= (hoveredRating || rating) 
                  ? "fill-amber-400 text-amber-400" 
                  : "text-slate-200 fill-slate-50 hover:text-amber-200"
              }`} 
            />
          </button>
        ))}
        <span className="ml-3 text-sm font-bold text-slate-400">
          {rating > 0 ? `${rating}/5` : "Select a rating"}
        </span>
      </div>

      {/* THE COMMENT BOX */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Leave a review (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you learn? Was the tutor helpful?"
          className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-colors resize-none h-28 text-sm"
        />
      </div>

      {status?.type === "error" && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm font-bold mb-4">
          <AlertCircle className="w-5 h-5 shrink-0" /> {status.message}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isPending || rating === 0}
        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Review"}
      </button>
    </div>
  );
}