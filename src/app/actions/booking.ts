"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
// Note: You may need to import your NextAuth configuration here depending on your setup
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function createBooking(
  tutorId: string, 
  day: string, 
  timeSlot: string
) {
  try {
    // ✨ SECURITY CHECK 1 & 2: Grab the active session
    const session = await getServerSession(authOptions); 
    if (!session || !session.user) {
      return { success: false, error: "You must be logged in to book a lesson." };
    }

    // ✨ SECURITY CHECK 3: Are they a student?
    if (session.user.role !== "STUDENT") {
      return { success: false, error: "Only students can book lessons! Tutors cannot book other tutors." };
    }

    // ==========================================
    // ✨ THE FIX: FIND OR CREATE THE STUDENT PROFILE
    // ==========================================
    let studentProfile = await prisma.student.findUnique({
      where: { userId: session.user.id }
    });

    // If Alex just signed up and doesn't have a Student profile yet, make one automatically!
    if (!studentProfile) {
      studentProfile = await prisma.student.create({
        data: {
          userId: session.user.id,
          name: session.user.name || "New Student",
          email: session.user.email || "No email provided" // Adds a fallback just in case
        }
      });
    }

    // THE LOCK: Check if ANY non-cancelled booking already exists for this slot
    const existingBooking = await prisma.booking.findFirst({
      where: {
        tutorId: tutorId,
        day: day,
        timeSlot: timeSlot,
        status: {
          not: "CANCELLED" 
        }
      }
    });

    if (existingBooking) {
      return { 
        success: false, 
        error: "Sorry, this time slot was just grabbed by someone else!" 
      };
    }

    // ✨ Create the booking using the STUDENT profile ID, not the User ID!
    const booking = await prisma.booking.create({
      data: {
        day: day,
        timeSlot: timeSlot,
        status: "PENDING",
        tutor: { connect: { id: tutorId } },
        student: { connect: { id: studentProfile.id } } // <-- THIS WAS THE MISSING LINK
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/tutor/${tutorId}`);
    
    return { success: true, booking };
  } catch (error) {
    console.error("Booking Error:", error);
    return { success: false, error: "A server error occurred while trying to book." };
  }
}

export async function updateBookingStatus(bookingId: string, newStatus: "CONFIRMED" | "CANCELLED") {
  try {
    const session = await getServerSession();

    // ✨ SECURITY CHECK 1: Are they logged in and a Tutor?
    if (!session || !session.user || session.user.role !== "TUTOR") {
      return { success: false, error: "Access denied. Only tutors can manage booking statuses." };
    }

    // Fetch the original booking
    const targetBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!targetBooking) {
      return { success: false, error: "Booking not found in the database." };
    }

    // ✨ SECURITY CHECK 2: Does this tutor actually own this booking?
    if (targetBooking.tutorId !== session.user.id) {
      return { success: false, error: "Security alert: You cannot modify another tutor's schedule." };
    }

    // Update the status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus }
    });

    // THE MAGIC: If confirmed, automatically decline all competing requests!
    if (newStatus === "CONFIRMED") {
      await prisma.booking.updateMany({
        where: {
          tutorId: targetBooking.tutorId, 
          day: targetBooking.day,         
          timeSlot: targetBooking.timeSlot, 
          id: { not: bookingId },         
          status: "PENDING"               
        },
        data: {
          status: "CANCELLED" 
        }
      });
    }

    revalidatePath("/dashboard");
    
    return { success: true, booking: updatedBooking };
  } catch (error) {
    console.error("Update Booking Error:", error);
    return { success: false, error: "Failed to update the booking status." };
  }
}

// ==========================================
// STUDENT ACTION: CANCEL PENDING BOOKING
// ==========================================
// ==========================================
// STUDENT ACTION: CANCEL PENDING BOOKING
// ==========================================
export async function cancelBookingAsStudent(bookingId: string) {
  try {
    const session = await getServerSession(authOptions);

    // ✨ SECURITY CHECK 1: Must be a logged-in Student
    if (!session || !session.user || session.user.role !== "STUDENT") {
      return { success: false, error: "Unauthorized access." };
    }

    // ✨ THE FIX: Fetch the Student Profile so we have the correct ID to check against!
    const studentProfile = await prisma.student.findUnique({
      where: { userId: session.user.id }
    });

    if (!studentProfile) {
      return { success: false, error: "Student profile not found." };
    }

    const targetBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    // ✨ SECURITY CHECK 2: Compare against the Student Profile ID, not the User ID!
    if (!targetBooking || targetBooking.studentId !== studentProfile.id) {
      return { success: false, error: "Booking not found or unauthorized." };
    }

    // ✨ SECURITY CHECK 3: Can only cancel if it's still pending
    if (targetBooking.status !== "PENDING") {
      return { success: false, error: "Only pending requests can be cancelled." };
    }

    // Update the status to CANCELLED
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" }
    });

    // Refresh the dashboard to reflect the change
    revalidatePath("/dashboard/student");
    return { success: true };
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    return { success: false, error: "Failed to cancel booking." };
  }
}
