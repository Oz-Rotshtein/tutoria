'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function bookLesson(formData: FormData) {
  const tutorId = formData.get("tutorId") as string;
  const studentId = formData.get("studentId") as string;
  const startTime = new Date(formData.get("startTime") as string);

  // 1. Fetch the tutor to get their personal defaultDuration
  const tutor = await db.tutor.findUnique({
    where: { id: tutorId },
    select: { defaultDuration: true }
  });

  // 2. Use their preference, or fallback to 60 if not set
  const durationMinutes = tutor?.defaultDuration || 60;

  // 3. Calculate endTime (StartTime + Duration)
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  // 4. Create the lesson with the calculated endTime
  const overlapping = await db.lesson.findFirst({
  where: {
    tutorId,
    OR: [
      { startTime: { lt: endTime, gte: startTime } },
      { endTime: { gt: startTime, lte: endTime } }
    ]
  }
});

if (overlapping) throw new Error("This tutor is already booked at this time!");
  const lesson = await db.lesson.create({
    data: {
      tutorId,
      studentId,
      startTime,
      endTime,
      status: "PENDING"
    }
  });

  revalidatePath("/dashboard");
  return lesson;
}