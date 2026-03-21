"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DayOfWeek } from "@prisma/client";
import {TeachingMode} from "@prisma/client";

// ==========================================
// 1. UPDATE SETTINGS (
// ==========================================
export async function updateTutorSettings(formData: {
  bio: string;
  pricePerHour: number;
  defaultDuration: number;
  address: string;
  city: string;
  maxTravelDistance: number;
  teachingModes: TeachingMode[];
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TUTOR") {
      return { success: false, error: "Unauthorized access." };
    }

    const tutor = await prisma.tutor.findUnique({
      where: { userId: session.user.id }
    });

    if (!tutor) return { success: false, error: "Tutor profile not found." };

    // ✨ THE GEOCODER: Convert the address into coordinates
    let latitude: number | null = tutor.latitude;
    let longitude: number | null = tutor.longitude;

    // Only fetch new coordinates if they actually typed in a valid address and city
    if (formData.address && formData.city) {
      try {
        // We structure the query to be accurate. (You can hardcode the country if your MVP is local)
        const searchQuery = `${formData.address}, ${formData.city}, Israel`;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`, {
          headers: { 'User-Agent': 'TutorlyApp/1.0' } // OpenStreetMap requires a user agent
        });
        
        const data = await res.json();
        
        if (data && data.length > 0) {
          latitude = parseFloat(data[0].lat);
          longitude = parseFloat(data[0].lon);
          console.log(`📍 Geocoded Success: ${latitude}, ${longitude}`);
        }
      } catch (geoError) {
        console.error("Geocoding failed:", geoError);
        // We don't fail the whole update just because the map API hiccuped
      }
    }

    // Update the database with all the new data!
    await prisma.tutor.update({
      where: { id: tutor.id },
      data: {
        bio: formData.bio,
        pricePerHour: formData.pricePerHour,
        defaultDuration: formData.defaultDuration,
        address: formData.address,
        city: formData.city,
        maxTravelDistance: formData.maxTravelDistance,
        teachingModes: formData.teachingModes, // Save the array of selected modes!
        latitude,
        longitude
      }
    });

    revalidatePath("/dashboard/tutor");
    revalidatePath(`/tutor/${tutor.username}`);
    
    return { success: true };
  } catch (error) {
    console.error("Update Settings Error:", error);
    return { success: false, error: "Failed to update settings." };
  }
}

// ==========================================
// 2. ADD AVAILABILITY 
// ==========================================
export async function addAvailability(day: DayOfWeek, startTime: string, endTime: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TUTOR") {
      return { success: false, error: "Unauthorized access." };
    }

    const tutor = await prisma.tutor.findUnique({
      where: { userId: session.user.id }
    });

    if (!tutor) return { success: false, error: "Tutor profile not found." };

    // Save the new time slot to the database
    const newSlot = await prisma.availability.create({
      data: {
        day,
        startTime,
        endTime,
        tutorId: tutor.id
      }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/tutor/${tutor.username}`);

    return { success: true, slot: newSlot };
  } catch (error) {
    console.error("Add Availability Error:", error);
    return { success: false, error: "Failed to add time slot." };
  }
}

// ==========================================
// 3. DELETE AVAILABILITY 
// ==========================================
export async function deleteAvailability(slotId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TUTOR") {
      return { success: false, error: "Unauthorized access." };
    }

    // Verify this slot actually belongs to the logged-in tutor before deleting!
    const slot = await prisma.availability.findUnique({
      where: { id: slotId },
      include: { tutor: true }
    });

    if (!slot || slot.tutor.userId !== session.user.id) {
      return { success: false, error: "Slot not found or unauthorized." };
    }

    // Destroy the slot
    await prisma.availability.delete({
      where: { id: slotId }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/tutor/${slot.tutor.username}`);

    return { success: true };
  } catch (error) {
    console.error("Delete Availability Error:", error);
    return { success: false, error: "Failed to delete time slot." };
  }
}
// ==========================================
// 4. EXPERIENCE (Add & Delete)
// ==========================================
export async function addExperience(data: {
  title: string;
  company: string;
  startYear: number;
  endYear?: number;
  description?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TUTOR") return { success: false, error: "Unauthorized" };

    const tutor = await prisma.tutor.findUnique({ where: { userId: session.user.id } });
    if (!tutor) return { success: false, error: "Tutor not found" };

    await prisma.experience.create({
      data: {
        ...data,
        tutorId: tutor.id,
      }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/tutor/${tutor.username}`);
    return { success: true };
  } catch (error) {
    console.error("Add Experience Error:", error);
    return { success: false, error: "Failed to add experience." };
  }
}

export async function deleteExperience(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TUTOR") return { success: false, error: "Unauthorized" };

    // Security: Only delete if it belongs to this tutor
    const exp = await prisma.experience.findUnique({ where: { id }, include: { tutor: true } });
    if (!exp || exp.tutor.userId !== session.user.id) return { success: false, error: "Unauthorized" };

    await prisma.experience.delete({ where: { id } });
    revalidatePath("/dashboard");
    revalidatePath(`/tutor/${exp.tutor.username}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete experience." };
  }
}

// ==========================================
// 5. EDUCATION (Add & Delete)
// ==========================================
export async function addEducation(data: {
  degree: string;
  institution: string;
  startYear: number;
  endYear?: number;
  description?: string;
  documentUrl?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TUTOR") return { success: false, error: "Unauthorized" };

    const tutor = await prisma.tutor.findUnique({ where: { userId: session.user.id } });
    if (!tutor) return { success: false, error: "Tutor not found" };

    await prisma.education.create({
    data: {
        tutorId: tutor.id,
        institution: data.institution,
        degree: data.degree,
        startYear: data.startYear,
        endYear: data.endYear,
        documentUrl: data.documentUrl,
      }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/tutor/${tutor.username}`);
    return { success: true };
  } catch (error) {
    console.error("Add Education Error:", error);
    return { success: false, error: "Failed to add education." };
  }
}

export async function deleteEducation(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TUTOR") return { success: false, error: "Unauthorized" };

    const edu = await prisma.education.findUnique({ where: { id }, include: { tutor: true } });
    if (!edu || edu.tutor.userId !== session.user.id) return { success: false, error: "Unauthorized" };

    await prisma.education.delete({ where: { id } });
    revalidatePath("/dashboard");
    revalidatePath(`/tutor/${edu.tutor.username}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete education." };
  }
}

// ==========================================
// 6. SUBJECTS (Toggle)
// ==========================================
export async function toggleSubject(subjectId: string, isConnecting: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TUTOR") return { success: false, error: "Unauthorized" };

    const tutor = await prisma.tutor.findUnique({ where: { userId: session.user.id } });
    if (!tutor) return { success: false, error: "Tutor not found" };

    // Either connect or disconnect the subject from this tutor
    await prisma.tutor.update({
      where: { id: tutor.id },
      data: {
        subjects: isConnecting 
          ? { connect: { id: subjectId } } 
          : { disconnect: { id: subjectId } }
      }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/tutor/${tutor.username}`);
    return { success: true };
  } catch (error) {
    console.error("Toggle Subject Error:", error);
    return { success: false, error: "Failed to update subjects." };
  }
}

// ==========================================
// 7. CREATE & CONNECT NEW SUBJECT
// ==========================================
export async function createAndConnectSubject(name: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TUTOR") return { success: false, error: "Unauthorized" };

    const tutor = await prisma.tutor.findUnique({ where: { userId: session.user.id } });
    if (!tutor) return { success: false, error: "Tutor not found" };

    // 1. Clean up the input (trim extra spaces)
    const cleanName = name.trim();
    if (!cleanName) return { success: false, error: "Subject name cannot be empty." };

    // 2. Search the database to see if this subject already exists (case-insensitive!)
    let subject = await prisma.subject.findFirst({
      where: {
        name: {
          equals: cleanName,
          mode: 'insensitive' // 'Math' and 'math' will be treated as the same
        }
      }
    });

    // 3. If it doesn't exist, create it!
    if (!subject) {
      subject = await prisma.subject.create({
        data: { name: cleanName }
      });
    }

    // 4. Connect the subject (whether it's brand new or pre-existing) to this specific tutor
    await prisma.tutor.update({
      where: { id: tutor.id },
      data: {
        subjects: {
          connect: { id: subject.id }
        }
      }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/tutor/${tutor.username}`);
    return { success: true, subject };
  } catch (error) {
    console.error("Create Subject Error:", error);
    return { success: false, error: "Failed to create subject." };
  }
}

// ==========================================
// 8. UPDATE PROFILE IMAGE
// ==========================================
export async function updateProfileImage(imageUrl: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TUTOR") return { success: false, error: "Unauthorized" };

    const tutor = await prisma.tutor.findUnique({ where: { userId: session.user.id } });
    if (!tutor) return { success: false, error: "Tutor not found" };

    // We update the User model since that's where NextAuth usually stores the avatar
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/tutor/${tutor.username}`);
    return { success: true };
  } catch (error) {
    console.error("Update Image Error:", error);
    return { success: false, error: "Failed to update profile image." };
  }
}