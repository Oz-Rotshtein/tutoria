'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function bookLesson(formData: FormData) {
  const tutorId = formData.get("tutorId") as string;
  const studentId = formData.get("studentId") as string;
  const startTime = new Date(formData.get("startTime") as string);
  const endTime = new Date(formData.get("endTime") as string);

  // 1. Create the lesson in the database
  await db.lesson.create({
    data: {
      tutorId,
      studentId,
      startTime,
      endTime : new Date(startTime.getTime() + 60 * 60 * 1000),
      status: "PENDING"
    }
  });

  // 2. Refresh the page to show the slot is now taken
  revalidatePath("/book");
}