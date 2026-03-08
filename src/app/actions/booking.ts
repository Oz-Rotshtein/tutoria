"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createBooking(
  tutorId: string, 
  studentId: string, 
  day: string, 
  timeSlot: string
) {
  try {
    // ✨ THE LOCK: Check if ANY non-cancelled booking already exists for this slot
    const existingBooking = await db.booking.findFirst({
      where: {
        tutorId: tutorId,
        day: day,
        timeSlot: timeSlot,
        status: {
          not: "CANCELLED" // This blocks both PENDING and CONFIRMED requests
        }
      }
    });

    // If someone already grabbed it, reject the new request immediately
    if (existingBooking) {
      return { 
        success: false, 
        error: "Sorry, this time slot is already pending or booked by someone else." 
      };
    }

    // If it's completely free, proceed with creation
    const booking = await db.booking.create({
      data: {
        day: day,
        timeSlot: timeSlot,
        status: "PENDING",
        tutor: { connect: { id: tutorId } },
        student: { connect: { id: studentId } }
      },
    });

    // Update the UI cache
    revalidatePath("/dashboard");
    revalidatePath(`/tutor/${tutorId}`);
    
    return { success: true, booking };
  } catch (error) {
    console.error("Booking Error:", error);
    return { success: false, error: "Failed to create booking" };
  }
}

export async function updateBookingStatus(bookingId: string, newStatus: "CONFIRMED" | "CANCELLED") {
  try {
    // 1. Fetch the original booking so we know the day, time, and tutor
    const targetBooking = await db.booking.findUnique({
      where: { id: bookingId }
    });

    if (!targetBooking) {
      return { success: false, error: "Booking not found." };
    }

    // 2. Update the status of the booking the tutor clicked
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: { status: newStatus }
    });

    // 3. ✨ THE MAGIC: If confirmed, automatically decline all competing requests!
    if (newStatus === "CONFIRMED") {
      await db.booking.updateMany({
        where: {
          tutorId: targetBooking.tutorId, // Same tutor
          day: targetBooking.day,         // Same day
          timeSlot: targetBooking.timeSlot, // Same time
          id: { not: bookingId },         // Exclude the one we JUST confirmed
          status: "PENDING"               // Only target requests still waiting
        },
        data: {
          status: "CANCELLED" // Auto-decline them
        }
      });
    }

    // 4. Revalidate so the dashboard refreshes instantly
    revalidatePath("/dashboard");
    
    return { success: true, booking: updatedBooking };
  } catch (error) {
    console.error("Update Booking Error:", error);
    return { success: false, error: "Failed to update booking status." };
  }
}