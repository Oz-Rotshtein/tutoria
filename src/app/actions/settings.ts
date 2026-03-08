"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { DayOfWeek } from "@prisma/client";
// 1. Action to update basic settings (Price, Duration, Bio)
export async function updateTutorSettings(tutorId: string, formData: FormData) {
  const price = Number(formData.get("pricePerHour"));
  const duration = Number(formData.get("defaultDuration"));
  const bio = formData.get("bio") as string;

  await db.tutor.update({
    where: { id: tutorId },
    data: { 
      pricePerHour: price, 
      defaultDuration: duration,
      bio: bio
    },
  });

  // Force the dashboard and profile pages to pull the fresh data
  revalidatePath(`/dashboard/[username]`, 'page');
  revalidatePath(`/tutor/[username]`, 'page');
}

// 2. Action to add a new timeslot
export async function addAvailability(tutorId: string, day: string, startTime: string, endTime: string) {
  await db.availability.create({
    data: {
      tutorId,
      day: day as DayOfWeek,    // e.g., "MONDAY"
      startTime,  // e.g., "09:00 - 10:00"
      endTime,
    }
  });
  
  revalidatePath(`/dashboard/[username]`, 'page');
}

// 3. Action to delete a timeslot
export async function deleteAvailability(availabilityId: string) {
  await db.availability.delete({
    where: { id: availabilityId }
  });
  
  revalidatePath(`/dashboard/[username]`, 'page');
}