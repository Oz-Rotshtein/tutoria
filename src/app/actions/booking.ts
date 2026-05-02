"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
// Note: You may need to import your NextAuth configuration here depending on your setup
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function createBooking(data: {
  tutorId: string;
  date: string; // The exact date the student picked (YYYY-MM-DD)
  timeSlot: string;
  mode: "ONLINE" | "IN_PERSON_TUTOR" | "IN_PERSON_STUDENT";
  isRecurring: boolean;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
      return { success: false, error: "Only logged-in students can book lessons." };
    }

    // Find the student's profile ID
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    });

    if (!student) return { success: false, error: "Student profile not found." };

    // ✨ THE RECURRING MATH ENGINE
    const startDate = new Date(data.date);
    const bookingsToCreate = [];
    
    // Create a random group ID so we can group these 4 lessons together later
    const groupId = data.isRecurring ? Math.random().toString(36).substring(2, 11) : null;
    const numberOfWeeks = data.isRecurring ? 4 : 1; // Book 1 month in advance if recurring
    const daysMap = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

    for (let i = 0; i < numberOfWeeks; i++) {
      const nextDate = new Date(startDate);
      nextDate.setDate(startDate.getDate() + (i * 7)); // Add 7 days for each loop
      const dayName = daysMap[nextDate.getDay()];

      bookingsToCreate.push({
        studentId: student.id,
        tutorId: data.tutorId,
        date: nextDate,
        day: dayName,
        timeSlot: data.timeSlot,
        mode: data.mode,
        isRecurring: data.isRecurring,
        recurringGroupId: groupId,
        status: "PENDING" // Starts as pending until the tutor approves it!
      });
    }

    // Save all of them to the database at once!
    await prisma.booking.createMany({
      data: bookingsToCreate
    });

    revalidatePath("/dashboard/student");
    return { success: true };
  } catch (error) {
    console.error("Booking Error:", error);
    return { success: false, error: "Failed to create booking." };
  }
}

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  try {
    // 1. Find the specific booking the tutor clicked on
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) return { success: false, error: "Booking not found." };

    // ✨ 2. THE BULK APPROVE LOGIC
    // If this booking is part of a weekly recurring group, update ALL of them at once!
    if (booking.recurringGroupId && newStatus === 'CONFIRMED') {
      await prisma.booking.updateMany({
        where: { recurringGroupId: booking.recurringGroupId },
        data: { status: newStatus }
      });
    } else {
      // Otherwise, just update the single lesson normally
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: newStatus }
      });
    }

    // Refresh the dashboard
    revalidatePath("/dashboard/tutor");
    return { success: true };
    
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false, error: "Could not update status." };
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
export async function saveTutorNotes(bookingId: string, notes: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TUTOR") {
      return { success: false, error: "Unauthorized access." };
    }

    // Update the booking with the new notes
    await prisma.booking.update({
      where: { id: bookingId },
      data: { tutorNotes: notes }
    });

    // Refresh the dashboard so the notes show up instantly
    revalidatePath("/dashboard/tutor");

    return { success: true };
  } catch (error) {
    console.error("Failed to save notes:", error);
    return { success: false, error: "Could not save notes." };
  }
}
