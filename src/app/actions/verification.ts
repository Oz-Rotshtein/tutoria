"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function submitVerificationDocument(filePath: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TUTOR") {
      return { success: false, error: "Unauthorized access." };
    }

    const tutor = await prisma.tutor.findUnique({
      where: { userId: session.user.id }
    });

    if (!tutor) return { success: false, error: "Tutor not found." };

    // Update the tutor to be officially verified!
    // (In a real production app, this would trigger an "admin review" status instead)
    await prisma.tutor.update({
      where: { id: tutor.id },
      data: { isVerified: true }
    });

    revalidatePath("/dashboard/tutor");
    revalidatePath(`/tutor/${tutor.username}`);
    revalidatePath("/tutors");

    return { success: true };
  } catch (error) {
    console.error("Verification Error:", error);
    return { success: false, error: "Failed to update verification status." };
  }
}