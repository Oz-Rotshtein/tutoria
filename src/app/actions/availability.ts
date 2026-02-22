"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Define the shape of the data we expect from the form
type TimeSlot = {
  day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "17:00"
};

export async function updateAvailability(tutorId: string, schedule: TimeSlot[]) {
  try {
    if (!tutorId) throw new Error("No Tutor ID provided");
    
    console.log("📅 Updating schedule for:", tutorId);
    console.log("🔢 New slots count:", schedule.length);

    // We use a Transaction to ensure the "Wipe & Rewrite" happens safely
    await db.$transaction(async (tx) => {
      
      // 1. Delete ALL existing slots for this tutor
      await tx.availability.deleteMany({
        where: { tutorId: tutorId }
      });

      // 2. Create the NEW slots
      if (schedule.length > 0) {
        await tx.availability.createMany({
          data: schedule.map(slot => ({
            tutorId: tutorId,
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime
          }))
        });
      }
    });

    console.log("✅ Schedule saved successfully!");

    //revalidatePath("/dashboard/settings");
    ///revalidatePath(`/tutor/${tutorId}`); 
    
    return { success: true };
  } catch (error) {
    console.error("❌ SCHEDULE UPDATE FAILED:", error);
    return { success: false, error: "Failed to save schedule" };
  }
}