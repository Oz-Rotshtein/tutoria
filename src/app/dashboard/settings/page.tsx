import { db } from "@/lib/db";
import SettingsForm from "@/components/SettingsForm"; // Importing the component
import AvailabilitySettings from "@/components/AvailabilitySettings";
export const dynamic = 'force-dynamic';

// THIS IS THE PAGE
export default async function SettingsPage() {
  // 1. Fetch data from DB
  const tutor = await db.tutor.findFirst({
    where: {
      name: {
        contains: "Sarah", 
        mode: 'insensitive'
      }
    },
    include: {
      subjects: true, 
      availability: true
    }
  });

  if (!tutor) {
    return <div className="p-10 font-bold text-red-500">Error: Tutor not found.</div>;
  }

  // 2. Render the Component and pass the data
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
        <p className="text-slate-500">Update your public tutor information</p>
      </div>
      
      {/* Passing 'tutor' as 'initialData' */}
      <SettingsForm initialData={tutor} />
      <AvailabilitySettings tutorId={tutor.id} initialData={tutor.availability}/>
    </div>
  );
}