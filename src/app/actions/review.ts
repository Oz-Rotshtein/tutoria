"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function submitReview(formData: {
  bookingId: string;
  tutorId: string;
  rating: number;
  comment: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "STUDENT") {
      return { success: false, error: "Only students can leave reviews." };
    }

    // 1. Verify the booking actually exists and belongs to this student
    const booking = await prisma.booking.findUnique({
      where: { id: formData.bookingId },
      include: { student: true }
    });

    if (!booking || booking.student.userId !== session.user.id) {
      return { success: false, error: "Invalid booking." };
    }

    // 2. Make sure they haven't already reviewed this exact lesson
    const existingReview = await prisma.review.findUnique({
      where: { bookingId: formData.bookingId }
    });

    if (existingReview) {
      return { success: false, error: "You already reviewed this lesson." };
    }

    // 3. Save the review to the database!
    await prisma.review.create({
      data: {
        rating: formData.rating,
        comment: formData.comment,
        bookingId: formData.bookingId,
        tutorId: formData.tutorId,
        studentId: booking.studentId,
      }
    });

    // 4. Update the booking status to COMPLETED so the UI knows it's totally finished
    await prisma.booking.update({
      where: { id: formData.bookingId },
      data: { status: "COMPLETED" }
    });

    revalidatePath("/dashboard/student");
    revalidatePath(`/tutor/${formData.tutorId}`); // Update the tutor's public profile!

    return { success: true };
  } catch (error) {
    console.error("Review Submission Error:", error);
    return { success: false, error: "Failed to submit review." };
  }
}