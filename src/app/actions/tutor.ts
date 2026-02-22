"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. UPDATE THE TYPE DEFINITION HERE
export async function updateTutorProfile(tutorId: string, data: {
  bio: string;
  pricePerHour: number;
  subjects: string[]; // <--- You must add this line!
}) {
  try {
    if (!tutorId) throw new Error("No Tutor ID provided");
    
    console.log("🛠️ Updating subjects for:", tutorId);
    console.log("📚 Subjects to save:", data.subjects);

    // 2. TRANSACTION: Clear old subjects -> Add new ones
    // We use a transaction to make sure we don't end up with half-saved data
    await db.$transaction(async (tx) => {
      
      // Step A: Disconnect ALL existing subjects (Reset the list)
      await tx.tutor.update({
        where: { id: tutorId },
        data: {
          subjects: {
            set: [], 
          }
        }
      });

      // Step B: Connect or Create the new subjects
      await tx.tutor.update({
        where: { id: tutorId },
        data: {
          bio: data.bio,
          pricePerHour: data.pricePerHour,
          subjects: {
            connectOrCreate: data.subjects.map((subjectName) => ({
              where: { name: subjectName }, // Use the existing subject if found...
              create: { name: subjectName } // ...or create a new one!
            }))
          }
        }
      });
    });

    console.log("✅ Success! Profile and Subjects updated.");

    revalidatePath("/dashboard/settings");
    // We use a wildcard here to be safe, but specific paths are better if you have the username
    revalidatePath("/tutor/[username]"); 
    
    return { success: true };
  } catch (error) {
    console.error("❌ UPDATE FAILED:", error);
    return { success: false, error: "Database update failed." };
  }
}